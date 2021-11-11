import { useState } from "react";

import useFirebaseStorage from "../hooks/useFirebaseStorage";

import styles from "./ProfileImageModal.module.css";

import { Card } from "@mui/material";
import { Paper } from "@mui/material";
import { Button } from "@mui/material";
import { Input } from "@mui/material";

const ProfileImageModal = (props) => {
  const { uploadProfilePicture, deleteProfilePicture, listFiles } =
    useFirebaseStorage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isSelected, setIsSelected] = useState(false);

  const inputFileHandler = (e) => {
    setPreviewFile(URL.createObjectURL(e.target.files[0]));
    setSelectedFile(e.target.files[0]);

    setIsSelected(true);
  };

  const submitPictureHandler = async (e) => {
    e.preventDefault();
    if (isSelected) {
      props.setIsLoadingPicture(true);
      const files = await listFiles();

      if (files.includes(props.userId)) {
        await deleteProfilePicture(props.userId);
      }
      await uploadProfilePicture(props.userId, selectedFile);

      props.setIsLoadingPicture(false);
      props.closeModal();
      return;
    }
    console.log("No file selected!");
  };

  return (
    <Card sx={{ bgcolor: "primary.main" }} className={styles.card}>
      <section className={styles["img-section"]}>
        <Paper sx={{ bgcolor: "primary.light" }} className={styles.box}>
          <div className={styles["img-container"]}>
            {previewFile && <img src={previewFile} alt="preview" />}
            {!previewFile && "Choose your picture"}
          </div>
        </Paper>
      </section>

      <form className={"input-section"} onSubmit={submitPictureHandler}>
          <Input color="primary" disableUnderline={true} id="image-input" type="file" onChange={inputFileHandler} />
        <div className={styles["button-container"]}>
          <Button
            variant="contained"
            color={"secondary"}
            className={styles.button}
            type="submit"
          >
            Apply
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileImageModal;
