import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';


// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import DeleteSongModal from './components/DeleteSongModal.js';
import EditSongModal from './components/EditSongModal';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';


class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion: null,
            songKeyPairMarkedForEdit: null,
            songPairMarkedForDeletion: null,
            modalOpen: false,
            currentList: null,
            sessionData: loadedSessionData
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songKeyPairMarkedForEdit: prevState.songKeyPairMarkedForEdit,
            songPairMarkedForDeletion: prevState.songPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        this.tps.clearAllTransactions();
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: null,
            songKeyPairMarkedForEdit: null,
            songPairMarkedForDeletion: null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.tps.clearAllTransactions();
        });
    }

    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key)
        this.hideDeleteListModal()
    }

    deleteMarkedSong = () => {
        this.deleteSong(this.state.songPairMarkedForDeletion)
        this.setStateWithUpdatedList(this.state.currentList)
        this.hideDeleteSongModal()
    }

    deleteSong = (index) => {
        let actualIndex = (index)
        this.state.currentList.songs.splice(actualIndex, 1)
        this.setStateWithUpdatedList(this.state.currentList)
    }

    deleteLastSong = () => {
        this.state.currentList.songs.pop()
        this.setStateWithUpdatedList(this.state.currentList)
    }

    editSong = (title, artist, id, index) => {
        this.state.currentList.songs.splice(index, 1, { "title": title, "artist": artist, "youTubeId": id })
        this.setStateWithUpdatedList(this.state.currentList);
    }

    addRemovedSong = (prevSong, index) => {
        this.state.currentList.songs.splice(index, 0, prevSong)
        this.setStateWithUpdatedList(this.state.currentList)
    }



    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: null,
            songKeyPairMarkedForEdit: prevState.songKeyPairMarkedForEdit,
            songPairMarkedForDeletion: prevState.songPairMarkedForDeletion,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        this.tps.clearAllTransactions();

        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songKeyPairMarkedForEdit: prevState.songKeyPairMarkedForEdit,
            songPairMarkedForDeletion: prevState.songPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }))
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.tps.clearAllTransactions();

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songKeyPairMarkedForEdit: null,
            songPairMarkedForDeletion: null,
            currentList: null,
            sessionData: this.state.sessionData
        }))
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songKeyPairMarkedForEdit: prevState.songKeyPairMarkedForEdit,
            songPairMarkedForDeletion: prevState.songPairMarkedForDeletion,
            currentList: list,
            sessionData: this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }

    addDeleteSongTransaction = () => {
        let index = this.state.currentList.songs.indexOf(this.state.songPairMarkedForDeletion)
        let transaction = new DeleteSong_Transaction(this, this.state.songPairMarkedForDeletion, index);
        this.tps.addTransaction(transaction);
        this.setStateWithUpdatedList(this.state.currentList)
        this.hideDeleteSongModal()
    }

    addEditSongTransaction = () => {
        //getting new song values
        let newTitle = document.getElementById("Title").value
        let newArtist = document.getElementById("Artist").value
        let newYouTubeId = document.getElementById("Id").value
        //getting old song values
        let oldTitle = this.state.songKeyPairMarkedForEdit.title
        let oldArtist = this.state.songKeyPairMarkedForEdit.artist
        let oldYouTubeId = this.state.songKeyPairMarkedForEdit.youTubeId
        //getting index of the song to be edited(FOR UNDO)
        let index = this.state.currentList.songs.indexOf(this.state.songKeyPairMarkedForEdit)
        let transaction = new EditSong_Transaction(this, oldTitle, oldArtist, oldYouTubeId, newTitle, newArtist, newYouTubeId, index);
        this.tps.addTransaction(transaction);
        this.setStateWithUpdatedList(this.state.currentList);
        this.hideEditSongModal();
    }

    addAddSongTransaction = () => {
        let transaction = new AddSong_Transaction(this);
        this.tps.addTransaction(transaction);
    }

    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: keyPair,
            songKeyPairMarkedForEdit: prevState.songKeyPairMarkedForEdit,
            songPairMarkedForDeletion: prevState.songPairMarkedForDeletion,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }

    markSongForDeletion = (index) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songKeyPairMarkedForEdit: prevState.songKeyPairMarkedForEdit,
            songPairMarkedForDeletion: index,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteSongModal();
        });
    }

    markSongForEdit = (song) => {
        let modal = document.getElementById("edit-song-modal");
        document.getElementById("Title").value = song.title
        document.getElementById("Artist").value = song.artist
        document.getElementById("Id").value = song.youTubeId
        modal.classList.add("is-visible");
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            songKeyPairMarkedForEdit: song
        }), () => {
            this.setModalState()
        });
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
        this.setModalState()
    }

    showDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
        this.setModalState()
    }

    // showEditSongModal = () => {
    //     let modal = document.getElementById("edit-song-modal");
    //     modal.classList.add("is-visible");
    //     this.setModalState()
    // }

    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        this.setModalState()
    }

    hideDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
        this.setModalState()
    }

    hideEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        this.setModalState()
    }

    setModalState = () => {
        if (this.state.modalOpen) {
            this.setState(prevState => ({
                modalOpen: false
            }));
        } else {
            this.setState(prevState => ({
                modalOpen: true
            }));
        }
    }

    handleKeyDown = (event) => {
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        if (!this.state.modalOpen) {
            if (event.key === "z" && (event.ctrlKey) && canUndo) {
                this.undo()
            } else if (event.key === "y" && (event.ctrlKey) && canRedo) {
                this.redo()
            }
        }
    }

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;

        if (this.state.modalOpen) {
            canAddSong = false
            canUndo = false
            canRedo = false
            canClose = false
        }

        return (
            <div id="root" onKeyDown={this.handleKeyDown} tabIndex="0">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    addSongCallback={this.addAddSongTransaction}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    editSongCallback={this.markSongForEdit}
                    deleteSongCallback={this.markSongForDeletion}
                    moveSongCallback={this.addMoveSongTransaction} />
                <Statusbar
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <DeleteSongModal
                    songPair={this.state.songPairMarkedForDeletion}
                    hideDeleteSongModalCallback={this.hideDeleteSongModal}
                    deleteSongCallback={this.addDeleteSongTransaction}
                />
                <EditSongModal
                    songKeyPair={this.state.songKeyPairMarkedForEdit}
                    hideSongModalCallback={this.hideEditSongModal}
                    editSongCallback={this.addEditSongTransaction} //this.addEditSongTransaction 
                />
            </div>
        );
    }
}

export default App;
