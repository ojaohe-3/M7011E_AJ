import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  BoxGeometry,
  Mesh,
  ShaderMaterial,
  PerspectiveCamera,
  MeshBasicMaterial,
  PlaneBufferGeometry,
} from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

const addEvent = (container: any, eventName: string, handler: Function) => {
  container.addEventListener(eventName, handler);
  return () => container.removeEventListener(eventName, handler);
};

export class SceneManager {
  private _container: HTMLDivElement;
  private _scene: Scene | null = null;
  private _renderer: WebGLRenderer | null = null;
  private _camera: OrthographicCamera | null = null;
  private _webglContextLoss: WEBGL_lose_context | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private _animationFrameId: number | null = null;
  private _width: number = 100;
  private _height: number = 100;
  private _controls: TrackballControls | null = null;
  private _unsubscribers: (() => void)[] = [];
  private _objects: { [key: string]: any } = {};

  constructor(private container: HTMLDivElement) {
    this._container = container;
    this._init();
  }

  private get _dimensions() {
    return {
      width: this._width,
      height: this._height,
    };
  }

  private set _dimensions(dimensions: { width: number; height: number }) {
    if (!this._camera || !this._renderer) {
      return;
    }
    this._width = dimensions.width;
    this._height = dimensions.height;
    this._renderer.setSize(this._width, this._height, true);
    this._camera.left = this._width / -2;
    this._camera.right = this._width / 2;
    this._camera.top = this._height / 2;
    this._camera.bottom = this._height / -2;
    this._camera.updateProjectionMatrix();
  }

  public get aspect() {
    return this._width / this._height || 1;
  }

  public get objects() {
    return Object.values(this._objects);
  }

  private _updateDimensions() {
    this._dimensions = {
      width: this._container.clientWidth,
      height: this._container.clientHeight,
    };
  }

  private _init() {
    const height = this._container.clientHeight;
    const width = this._container.clientWidth;

    this._scene = new Scene();
    this._camera = new OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      0.1,
      10000
    );
    this._camera.position.set(0, 0, 1200);
    this._scene.add(this._camera);
    this._controls = new TrackballControls(this._camera, this._container);
    this._controls.noRotate = true;
    this._controls.noRoll = true;
    this._controls.noZoom = false;
    this._controls.noPan = false;
    this._controls.staticMoving = true;

    // IF YOU WANNA CUSTOMIZE BEHAVIOR
    this._controls.zoomSpeed = 2.0;
    this._controls.panSpeed = 0.8;
    this._controls.dynamicDampingFactor = 0.2;

    this._renderer = new WebGLRenderer();
    this._webglContextLoss = this._renderer
      .getContext()
      .getExtension("WEBGL_lose_context");
    this._renderer.domElement.addEventListener(
      "webglcontextlost",
      this._onContextLost.bind(this),
      false
    );
    this._container.appendChild(this._renderer.domElement);

    //@ts-ignore
    window.sceneManager = this;
    // ... load items
  }

  private _initializeListeners() {
    this._unsubscribers.push(
      addEvent(this._controls, "start", this.getCameraChangeStart.bind(this))
    );
  }

  public getCameraChangeStart(handler: any) {}

  private _animate() {
    this._animationFrameId = requestAnimationFrame(this._animate.bind(this));
    this._renderer?.render(this._scene!, this._camera!);
    this._controls?.handleResize();
    this._controls?.update();
    // TODO: Animations
  }

  private _onContextLost() {
    if (this._webglContextLoss) {
      this._webglContextLoss.restoreContext();
    }
  }

  public add(obj: any) {
    if (!this._objects[obj.id]) {
      this._scene?.add(obj);
      this._objects[obj.id] = obj;
    }
  }
  public remove(obj: any) {
    if (this._objects[obj.id]) {
      this._scene?.remove(obj);
      // this._objects[obj.id].dipsose()
      delete this._objects[obj.id];
    }
  }

  public onContainerResize() {
    this._updateDimensions();
  }

  public init() {
    this.onContainerResize();
    if (!this._animationFrameId) {
      this._animate();
    }
  }
  public dispose() {
    for (const unsub of this._unsubscribers) {
      unsub();
    }

    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }
}
