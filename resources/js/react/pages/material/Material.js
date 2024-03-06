import ReactDOM from "react-dom";
import { useState } from "react";
import { Plus } from "react-feather";
import { Button, Card, CardHeader } from "reactstrap";
import { getUserAllowedRoleFromBlade } from "../../utility/Utils";
import MaterialTable from "../../components/material/MaterialTable";

const Material = () => {
  const [userRole] = useState(getUserAllowedRoleFromBlade());

  return (
    <>
      <Card>
        <CardHeader className="d-flex flex-row justify-content-end border-bottom">
          {["*", "create"].some((r) => userRole.includes(r)) && (
            <Button color="primary" tag="a" href="/material/add">
              <Plus size={15} />
              <span className="align-middle ml-50">Buat Materi Baru</span>
            </Button>
          )}
        </CardHeader>
        {["*", "read"].some((r) => userRole.includes(r)) && <MaterialTable />}
      </Card>
    </>
  );
};

export default Material;

const dom = document.getElementById("material-container");
if (dom) {
  ReactDOM.render(<Material />, dom);
}
