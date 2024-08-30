import React from "react";
import styles from "../../styling/Modal.module.scss";

const Modal2 = ({ handleClose, user }) => {
  console.log("Modal user is ", user);

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <div className={styles.text1}>User Profile</div>
          <div onClick={handleClose} className={styles.closebtn}>
            X
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.profilePic}>
            <img className={styles.dp} src={`${user?.createdUser.pic}`} alt="User" />
          </div>
          <div className={styles.details}>
            <p>Name : {user?.createdUser.name}</p>
            <p>Email : {user?.createdUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal2;
