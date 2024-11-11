import ph1 from "../../photo/2403a997-9417-4f59-adf0-2f84aa2e2a33.jpeg";
import ph2 from "../../photo/2819a42e-3c33-401a-94be-83a4e9d33321.jpeg";
import ph3 from "../../photo/29ca8cb9-d2ba-447a-9bc0-771c6cfb924f.jpeg";
import ph4 from "../../photo/326c79ce-9fc3-4709-9b89-4de0da953176.jpeg";
import ph5 from "../../photo/380fa8d6-a39a-46a4-9e54-dabc9e0a79ae.jpeg";
import ph6 from "../../photo/3D Avatar Collection Vol_01.jpeg";
import ph7 from "../../photo/3D.jpeg";
import ph8 from "../../photo/3D小人.jpeg";
import ph9 from "../../photo/3e973c1d-5f71-405d-96e5-85e4d0d5376a.jpeg";
import ph10 from "../../photo/5bfefc14-1b95-4365-9b66-1f0b3289e5dc.jpeg";
import ph11 from "../../photo/6aa20ce4-ee77-4fca-aff7-0d7545b681df.jpeg";
import ph12 from "../../photo/828c749a-fee4-4e62-a6cf-26b55229e037.jpeg";
import ph13 from "../../photo/A kid called BEAST _ NFT.jpeg";
import ph14 from "../../photo/a0ca8a4a-5b78-444c-a751-eafef5edb684.jpeg";
import ph15 from "../../photo/a7c8f326-4710-482e-bf2c-234215ec2241.jpeg";
import ph16 from "../../photo/Amazing 3D NFT Blender Render Artwork.jpeg";
import ph17 from "../../photo/mokey.jpeg";
import ph18 from "../../photo/Evil Face _ Smile Face.jpeg";
import ph19 from "../../photo/f47b467d-882e-4d94-bdb0-62b901f95acc.jpeg";
import ph20 from "../../photo/fb10b6aa-7717-420f-90b7-d1a727be6cfd.jpeg";
import ph21 from "../../photo/fcadf797-3264-47d5-a79b-6748b57b65b7.jpeg";
// import ph8 from "../../photo/3d-portrait-woman.jpg";

import Input from "../component/Input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function UsersPhoto() {
  let [info, setinfo] = useState({ photos: ph1, quite: "" });
  let [user, setuser] = useState(
    JSON.parse(localStorage.getItem("user:detail"))
  );
  const navigate = useNavigate();

  let photos = [
    ph1,
    ph2,
    ph3,
    ph4,
    ph5,
    ph6,
    ph7,
    ph8,
    ph9,
    ph10,
    ph11,
    ph12,
    ph13,
    ph14,
    ph15,
    ph16,
    ph17,
    ph18,
    ph19,
    ph20,
    ph21,
  ];

  const fetchavatars = async () => {
    const res = fetch(
      `https://dardesh2.onrender.com/api/quotes?email=${user.email}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
      }
    );
    console.log(info);
    navigate("/");
  };

  let handlechange = (name, value) => {
    setinfo({ ...info, [name]: value });
  };
  return (
    <div className="usercontenner">
      <div className="flexContener">
        <div className="avatars">
          {photos.map((p, i) => {
            return (
              <div
                key={i}
                style={{
                  backgroundImage: `url("${p}")`,
                  backgroundSize: "cover",
                  cursor: "pointer",
                }}
                className="box"
                onClick={(e) => {
                  const arr = Array.from(e.target.parentElement.children);
                  arr.map((a) => {
                    a.classList.remove("selected");
                  });
                  e.target.classList.add("selected");
                  handlechange("photos", p);
                }}
              ></div>
            );
          })}
          <span>select avatar</span>
        </div>
        <div className="quets">
          <Input
            label="quite"
            name="quite"
            classname="quite"
            type="text"
            placeholder="enter a quite"
            change={handlechange}
          />
          <button
            style={{ marginTop: "50px" }}
            onClick={() => {
              fetchavatars();
            }}
            className={`finish ${info.quite ? "" : "disabled"}`}
          >
            finish
          </button>
        </div>
      </div>
    </div>
  );
}
