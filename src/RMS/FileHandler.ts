import * as fs from 'fs'


export interface IFile{
    id: string;
    data: Buffer;
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

        fs.writeFileSync('./assets/'+file.id+'/profile.png',file.data);
        
    }
    
    public delete( id : string){
        this.files = this.files.filter(f => (f.id !== id));
    }

    public getFile( id : string) : Buffer{
        const entry = this.files.filter(f => f.id === id)[0];
        if(entry.data){
            return entry.data;
        }
        try {
            const data = fs.readFileSync('./assets/'+id+'/profile.png');

            if(entry){
                this.files[this.files.indexOf(entry)].data = data;
            }else{
                this.insert({id: id, data: data});
            }
            return data;
        } catch (error) {
            console.log(error);
            return fs.readFileSync('./assets/default.png');
        }


        
    }
}