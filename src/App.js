import React, { Component } from "react";
import Dropzone from "react-dropzone";
import Logo from "./components/Logo.js";
import List from "./components/List.js";
import Upload from "./components/Upload.js";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = { files: [] };

    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(files) {
    this.setState({
      files
    });
    console.log(files);
  }

  // TODO: Add reject/accept styles for dropzone
  render() {
    return (
      <div className="App">
        <Dropzone className="Dropzone" onDrop={this.onDrop} disableClick="true"> 
          <Logo />
          <Upload />
          <List />
        </Dropzone>
      </div>
    );
  }
}

export default App;
