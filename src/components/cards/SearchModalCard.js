import styles from "./SearchModalCard.module.css";
import SearchItem from "./search/SearchItem";
import Spinner from "../UI/Spinner";

const SearchModalCard = (props) => {
  return (
    <div className={styles["menu-box"]}>
      <section className={styles["menu-list"]}>
        {props.results.length === 0 && <Spinner className={styles.spin}/>}
        {!props.isLoadingSearch &&
          props.results !== null &&
          props.results.map((user) => (
            <SearchItem
              key={user.data.userId}
              user={user}
              foundUserHandler={props.foundUserHandler}
            />
          ))}
      </section>
    </div>
  );
};

export default SearchModalCard;
