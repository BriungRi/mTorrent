## mTorrent

An p2p file sharing desktop app built by Aditya S., Brian L., and Nathan L.

## How it works
We built a config server that acts as a centralized directory that maps filenames to the primary nodes that belong to replica sets which host the specific file. 

Upload:
When a peer drag-and-drops a file from his local machine to the desktop app, mTorrent will spin up a new mongod process, upload the file using GridFS, initialize the replica set, and send an update to the config server to create the filename to primary node mapping

Download:
When a peer clicks download on a file from the desktop app, mTorrent will spin up a new mongod process, make a request to the config server which sends a request to the primary node to add the requester to the replica set, sync with the nearest replica set neighbor, and download the file from the mongod process.

## If we had more time
We would've liked to add the ability to NAT hole punch to allow use of mTorrent outside of private networks. We would've also had more descriptive commit messages.
