import * as fs from 'fs'


export interface IFile{
    name: string;
    data?: Buffer;
}

export default class FileHander{
    
    private static _instance? :FileHander;
    private files :  IFile[] = []; //cache


    public static get instance() : FileHander{
        if(!this._instance){
            this._instance = new FileHander();
        }
        return this._instance;
    }
    
    public insert( file : IFile){
        this.files.push(file);
        setTimeout(this.delete, 3600000, file);
    }
    
    public delete( file : IFile){
        this.files = this.files.filter(f => !(file.name === f.name));
    }

    public getFile( name : string) : Buffer{
        const entry = this.files.filter(f => f.name === name)[0];
        if(entry.data){
            return entry.data;
        }
        const data = fs.readFileSync('./assets/'+name+'.png');

        if(entry){
            this.files[this.files.indexOf(entry)].data = data;
        }else{
            this.insert({name: name, data: data});
        }
        return data;

        
    }
}