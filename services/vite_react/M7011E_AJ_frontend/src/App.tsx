import { useEffect, useState } from 'react'
import { BoxGeometry, Mesh, MeshBasicMaterial, PlaneBufferGeometry } from 'three';
import ManagerControlComponent from './components/ControlBoards/MangerBoard';
import ProsumerControlComponent from './components/ControlBoards/ProsumerBoard';
import LoginPopup from './components/popups/LoginPopup';

import { SceneManager } from './scene/scene'

function App() {
  // let scene: SceneManager

  // const generateObjects = () => {
  //   const geometry = new BoxGeometry( 1, 1, 1 );
  //   const material = new MeshBasicMaterial( {color: 0x00ff00} );
  //   const cube = new Mesh(geometry, material);
  //   cube.scale.set(100, 100, 100)

  //   cube.name = 'TESTING woo'
  //   scene.add(cube);

  //   const material0 = new MeshBasicMaterial({wireframe: true, wireframeLinewidth: 1, color: 0xFF0000 });
  //   const mesh0 = new Mesh(geometry, material0);
  //   scene.add(mesh0);

  //   const g = new PlaneBufferGeometry(1000, 1000);
  //   const m1 =  new MeshBasicMaterial({wireframe: true, wireframeLinewidth: 1, color: 0xFF0000});
  //   const plane = new Mesh(g,m1);
  //   scene.add(plane);
  // }

  // useEffect(() => {
  //   const container = document.getElementById("container")
  //   if (!scene && container) {
  //     scene = new SceneManager(container as any)
  //     scene.init()
  //     new ResizeObserver(scene.onContainerResize.bind(scene)).observe(container)
  //     generateObjects()
  //   }
  // }, []);

  
  return (
    <div id="App" style={{width: "100vw", height: "100vh", margin: '0 auto'}}>
      <LoginPopup/>
    </div>
  )
}

export default App
