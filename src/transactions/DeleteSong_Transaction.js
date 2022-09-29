import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * MoveSong_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initCSong, initIndex) {
        super();
        this.app = initApp;
        this.cSong = initCSong;
        this.index = initIndex;
    }

    doTransaction() {
        this.app.deleteSong(this.index);
    }
    
    undoTransaction() {
        this.app.addRemovedSong(this.cSong, this.index);
    }
}