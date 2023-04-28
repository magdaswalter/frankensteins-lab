import React, { useState } from "react";
import { create } from "ipfs-http-client";

const infuraApiKey = process.env.REACT_APP_INFURA_API_KEY;
const infuraApiSecret = process.env.REACT_APP_INFURA_API_SECRET;
const authorization = "Basic " + btoa(infuraApiKey + ":" + infuraApiSecret);

const UploadToIpfs: React.FC = () => {
  const [imageCid, setImageCid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const ipfs = create({
        url: "https://ipfs.infura.io:5001/api/v0",
        headers: {
          authorization,
        },
      });

      const file = event.target.files?.[0];

      if (!file) {
        throw new Error("No file selected");
      }

      const result = await ipfs.add(file);

      setImageCid(result.path);
      setErrorMessage(null);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error uploading image to IPFS");
      setImageCid(null);
    }
  };

  return (
    <div>
      <h1>
        Greetings! This is a very dangerous place. At this place there is only
        one rule. And that rule is Norbi's rule! He can see you everywhere, be
        careful!
      </h1>
      <form>
        <input type="file" onChange={handleFileUpload} />
      </form>
      <div>
        fdfsudhfdfhdufhdfufhduhfufhud{process.env.REACT_APP_INFURA_API_KEY}
      </div>
      <div>
        rrrrrrrrdufhdfufhduhfufhud{process.env.REACT_APP_INFURA_API_SECRET}
      </div>
      {imageCid && (
        <div>
          <p>Image uploaded to IPFS with CID:</p>
          <p>{imageCid}</p>
          <img
            src={`https://gateway.pinata.cloud/ipfs/${imageCid}`}
            height={250}
            width={250}
            alt="Uploaded to IPFS. You can find it at the following link:"
          />
          <a href={`https://gateway.pinata.cloud/ipfs/${imageCid}`}>
            Here is a link to your picture
          </a>
        </div>
      )}
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default UploadToIpfs;
