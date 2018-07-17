import React, { Component } from "react";
import "./../style/List.css";
import cloud_download from "./../assets/cloud_download.png";

class List extends Component {
  render() {
    return (
      <div>
        <table className="Table">
          <tr>
            <th className="FilenameHeader">Filename</th>
            <th className="SeedHeader">Seeds</th>
            <th className="DownloadHeader" />
          </tr>
          <tr>
            <td>music.mp3</td>
            <td>23</td>
            <td className="DownloadElement">
              <img
                className="DownloadImage"
                src={cloud_download}
                alt="Download"
              />
            </td>
          </tr>
          <tr>
            <td>movie.mp4</td>
            <td>30</td>
            <td className="DownloadElement">
            <img
                className="DownloadImage"
                src={cloud_download}
                alt="Download"
              />
            </td>
          </tr>
          <tr>
            <td>files.zip</td>
            <td>9</td>
            <td className="DownloadElement">
            <img
                className="DownloadImage"
                src={cloud_download}
                alt="Download"
              />
            </td>
          </tr>
        </table>
      </div>
    );
  }
}

export default List;
