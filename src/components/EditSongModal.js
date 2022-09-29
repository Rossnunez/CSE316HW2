import React, { Component } from 'react';

export default class EditSongModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.title,
            artist: this.props.artist,
            ytID: this.props.youTubeId
        };
    }

    changeTitle(value) {
        this.setState({
            title: value
        });
    }
    changeArtist(value) {
        this.setState({
            artist: value
        });
    }
    changeYTID(value) {
        this.setState({
            ytID: value
        });
    }

    render() {
        const { songKeyPair, editSongCallback, hideSongModalCallback } = this.props;
        let title = ""
        let artist = ""
        let id = ""
        if(songKeyPair){
            title = songKeyPair.title
            artist = songKeyPair.artist
            id = songKeyPair.youTubeId
        }  

        return (
            <div
                className="modal"
                id="edit-song-modal"
                data-animation="slideInOutLeft">
                <div className="modal-root" id='verify-edit-song-root'>
                    <div className="modal-north">
                        Edit Song?
                    </div>
                    <div className="modal-center">
                        <div className="modal-center-content">
                            <label
                                style={{ float: 'left', fontSize: '25pt', fontWeight: 'bold' }} //"float: left; font-size: 25pt; font-weight: bold;" 
                                htmlFor="Title">Title:
                            </label>
                            <input
                                style={{ fontSize: '15pt', margin: '0px', float: 'right' }}//"font-size: 15pt; margin:0px; float: right;"
                                className="modal-button"
                                type="text"
                                id="Title"
                                name="Title"
                                defaultValue={title}
                                //onChange={e => this.changeTitle(e.target.value)}
                            />
                            <br />
                            <label
                                style={{ float: 'left', fontSize: '25pt', fontWeight: 'bold' }} //"float: left; font-size: 25pt; font-weight: bold;" 
                                htmlFor="Artist">
                                Artist:
                            </label>
                            <input
                                style={{ fontSize: '15pt', margin: '0px', float: 'right' }} //"font-size: 15pt; margin:0px; float: right;" 
                                className="modal-button"
                                type="text"
                                id="Artist"
                                name="Artist"
                                defaultValue={artist}
                                onChange={e => this.changeArtist(e.target.value)}
                            />
                            <br />
                            <label
                                style={{ float: 'left', fontSize: '25pt', fontWeight: 'bold' }}//"float: left; font-size: 25pt; font-weight: bold;" 
                                htmlFor="Id">
                                YoutubeId:
                            </label>
                            <input
                                style={{ fontSize: '15pt', margin: '0px', float: 'right' }} //"font-size: 15pt; margin:0px; float: right;" 
                                className="modal-button"
                                type="text"
                                id="Id"
                                name="Id"
                                defaultValue={id}
                                onChange={e => this.changeYTID(e.target.value)}
                            />
                            <br />
                        </div>
                    </div>
                    <div className="modal-south">
                        <input type="button"
                            id="edit-song-confirm-button"
                            className="modal-button"
                            onClick={editSongCallback}
                            value='Confirm' />
                        <input type="button"
                            id="edit-song-cancel-button"
                            className="modal-button"
                            onClick={hideSongModalCallback}
                            value='Cancel' />
                    </div>
                </div>
            </div>
        );
    }
}