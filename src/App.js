const unirest = require("unirest");

import React, { Component } from "react";
import Dropzone from "react-dropzone";
import Logo from "./components/Logo.js";
import List from "./components/List.js";
import Upload from "./components/Upload.js";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {};
    this.onDrop = this.onDrop.bind(this);
  }

  onDrop(files) {
    files.forEach(function(file) {
      unirest
        .post("http://localhost:3001/upload")
        .headers({
          Accept: "application/json",
          "Content-Type": "application/json"
        })
        .send({
          filename: file.name,
          filepath: file.path
        })
        .end(function(response) {
          console.log(response.body);
        });
    });
  }

  // TODO: Add reject/accept styles for dropzone
  render() {
    return (
      <div className="App">
        <Dropzone className="Dropzone" onDrop={this.onDrop} disableClick={true}>
          <Logo />
          <Upload />
          <List />
        </Dropzone>
      </div>
    );
  }
}

export default App;
