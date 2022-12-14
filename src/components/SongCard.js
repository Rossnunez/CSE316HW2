import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false
        }
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        if (targetId !== null && targetId !== "") {
            targetId = targetId.substring(target.id.indexOf("-") + 1);
            let sourceId = event.dataTransfer.getData("song");
            sourceId = sourceId.substring(sourceId.indexOf("-") + 1);

            this.setState(prevState => ({
                isDragging: false,
                draggedTo: false
            }));

            // ASK THE MODEL TO MOVE THE DATA
            this.props.moveCallback(sourceId, targetId);
        }
    }

    handleDoubleClick = (event) => {
        event.stopPropagation();
        this.props.editSongCallback(this.props.song);
    }

    handleDeleteSong = (event) => {
        event.stopPropagation();
        this.props.deleteSongCallback((this.props.song));
    }

    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length);
    }

    render() {
        const { song } = this.props;
        let num = this.getItemNum();
        let indexOfSong = num + "." //getting the index number of the song to show on the UI
        let youtubeLink = "https://www.youtube.com/watch?v=" + song.youTubeId; //getting the ytlink to hyperlink for each song in the UI
        console.log("num: " + num);
        let itemClass = "playlister-song";
        if (this.state.draggedTo) {
            itemClass = "playlister-song-dragged-to";
        }
        return (
            <div
                id={'song-' + num}
                className={itemClass}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                onDoubleClick={this.handleDoubleClick}
                draggable="true"
            >
                {indexOfSong} <span><a id={'song-' + num} href={youtubeLink}>{song.title} by {song.artist}</a></span>

                <input
                    id={'song-' + num}
                    type='button'
                    className="playlister-song-button"
                    onClick={this.handleDeleteSong}
                    value='X'
                    style={{ marginLeft: 'auto' }}
                ></input>
            </div>
        )
    }
}