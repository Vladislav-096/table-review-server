import { CustomTable } from "../Table/Table";
import "./style.css";

export const Main = () => {

  return (
    <section className="section-table">
      <div className="container">
        <div className="section-table-wrapper">
          <CustomTable />
        </div>
      </div>
    </section>
  );
};
