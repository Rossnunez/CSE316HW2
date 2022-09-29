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
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initOT, initOA, initOId, initNTitle, initNArtist, initNid, initIndex) {
        super();
        this.app = initApp;
        this.oT = initOT;
        this.oA = initOA;
        this.oId = initOId;
        //---->
        this.nTitle = initNTitle;
        this.nArtist = initNArtist;
        this.nId = initNid;
        this.ii = initIndex;
    }

    doTransaction() {
        this.app.editSong(this.nTitle, this.nArtist, this.nId, this.ii);
    }

    undoTransaction() {
        this.app.editSong(this.oT, this.oA, this.oId, this.ii);
    }
}