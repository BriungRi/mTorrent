import React, { Component } from "react";
import unirest from "unirest";
import cloud_download from "./../assets/cloud_download.png";
import "./../style/DownloadImg.css";

class DownloadImg extends Component {
  constructor(props) {
    super(props);
    this.state = { filename: this.props.filename };
    this.downloadFile = this.downloadFile.bind(this);
  }

  downloadFile() {
    unirest
      .post("http://localhost:3001/download")
      .headers({
        Accept: "application/json",
        "Content-Type": "application/json"
      })
      .send({ filename: this.props.filename })
      .end(function(response) {
        console.log(response.body);
      });
  }

  render() {
    return (
      <a href="#">
        <img
          className="DownloadImg"
          src={cloud_download}
          alt="Download"
          onClick={this.downloadFile}
        />
      </a>
    );
  }
}

export default DownloadImg;
