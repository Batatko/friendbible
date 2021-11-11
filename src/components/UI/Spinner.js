import styles from "./Spinner.module.css";

const Spinner = (props) => {
  return (
      <div className={styles.container}>
        <div className={`${styles.spinner} ${props.className}`}></div>
      </div>
  );
};

export default Spinner;
