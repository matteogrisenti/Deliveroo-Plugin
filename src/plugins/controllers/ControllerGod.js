const Controller = require('../../deliveroo/Controller');
const config =  require('../../../config')

const ParcelPlugin =  require('../entities/Parcel');
const Parcel = ParcelPlugin.extension; 

class ControllerGod extends Controller{

    constructor(subject, grid){

        super(subject, grid)

        //unlock the spawner tile of the god
        let tile = this.grid.getTile( this.subject.x, this.subject.y );
        tile.unlock();

    }

    //Overide the move method, the god can move everywhere 
    async move ( incr_x, incr_y ) {
        if ( this.subject.get('moving') ) return false;     
        
        this.subject.set('moving', true)                 
        await this.stepByStep( incr_x, incr_y );
        this.subject.set('moving', false)

        return { x: this.subject.x, y: this.subject.y };
    }

    //With the click the god can chang ethe type of cell  
    async click(x,y){
        
        let tile = this.grid.getTile(x,y)
        if ( !tile ) return;

        // Ottieni la mappa TILETYPEMAP dall'oggetto config
        const tileTypeMap = config.TILETYPEMAP;

        // Trova la posizione del valore associato all'attributo type di tile (ignorando maiuscole/minuscole)
        const tileType = tile.type.toLowerCase();
        const tileTypes = Object.values(tileTypeMap).map(value => value.toLowerCase());
        let currentIndex = tileTypes.indexOf(tileType);

        const nextIndex = (currentIndex + 1) % tileTypes.length;
        const nextType = Object.values(tileTypeMap)[nextIndex];
        let tileClass

        
        try {
            let tilePlugin = await require(`../tiles/${nextType}`)
            tileClass = tilePlugin.extension;
        } catch (error) {
            console.log(`Class ${nextType} not founded`);
            return;
        }

        // Crea una nuova tile del tipo successivo nella mappa
        const newTile = new tileClass(this.grid, x, y);
        
        await this.grid.removeTile(x,y)
        await this.grid.addTile(x,y,newTile)

    } 

    //spawn a parcel in the selected tile or if already exist one delete it
    async shiftClick(x,y){
        
        let tile = this.grid.getTile(x,y)
        let entity = Array.from(this.grid.getEntities()).find(e =>e.x == tile.x && e.y == tile.y)

        if(tile.type == 'spawner' && !entity){        // spawn a new parcel only if the cell i a spawner cell and it not contain already an entity

            let parcel = new Parcel(tile, this.grid)
            return 
            
        } 

        if(entity && entity.constructor.name == 'Parcel'){
            entity.delete()
        }

    } 
}


const ControlleGodPlugin = {
    name: 'ControllerGod',
    extension: ControllerGod,
    settings: { SUBJECTS: ['God'] }
}


module.exports = ControlleGodPlugin;