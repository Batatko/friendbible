import styles from "./Pagination.module.css";

const Pagination = ({ postsPerPage, totalPosts, currentPage, paginate }) => {
    let pageNumbers = [];
  
    for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
      pageNumbers.push(i);
    }
  
    return (
        <section className={styles["page-list"]}>
          {pageNumbers.map((num) => (
            <div className={styles["page-container"]} key={num}>
              <div className={`${styles["page"]} ${currentPage === num && styles["on-page"]}`} onClick={() => paginate(num)}>
                {num}
              </div>
            </div>
          ))}
        </section>
    );
  };
  
  export default Pagination;
  