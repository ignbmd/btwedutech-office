import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown, Plus, Search } from "react-feather";
import DataTable from "react-data-table-component";
import {
  Card,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
} from "reactstrap";

import { columns, getModules } from "../../../data/module-cpns-table";
import TableLoader from "../../core/skeleton-loader/TableLoader";

const ModuleTable = () => {
  const [data, setData] = useState();
  const [moduleInfo, setModuleInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const getModulesList = async (pages, search) => {
    try {
      setIsLoading(true);
      const res = await getModules({ pages, limit: 10, search });
      const data = res?.data ?? [];
      const info = res?.info ?? {};

      const startNumber = pages == 1 ? 0 : (pages - 1) * info.limit;
      const dataWithNumber = data.map((item, index) => ({
        no: startNumber + (index + 1),
        ...item,
      }));
      setData(dataWithNumber);
      setModuleInfo(info);
      setIsLoading(false);
    } catch (error) {
      setData(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getModulesList(currentPage + 1, searchValue);
  }, [currentPage, searchValue]);

  const handleFilter = (e) => {
    const value = e.target.value;
    if (e.keyCode === 13 || value === "") {
      setSearchValue(value);
      setCurrentPage(0);
    }
  };

  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=""
      nextLabel=""
      forcePage={currentPage}
      onPageChange={(page) => handlePagination(page)}
      pageCount={moduleInfo?.total_page}
      breakLabel="..."
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName="active"
      pageClassName="page-item"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      nextLinkClassName="page-link"
      nextClassName="page-item next"
      previousClassName="page-item prev"
      previousLinkClassName="page-link"
      pageLinkClassName="page-link"
      containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
    />
  );
  return (
    <Card>
      <Row className="justify-content-end mx-0">
        <Col
          className="d-flex align-items-center justify-content-end mt-1"
          md="6"
          sm="12"
        >
          <a href="/ujian-cpns/modul/create" className="btn btn-primary">
            <Plus size={14} /> Buat Modul
          </a>
        </Col>
      </Row>
      <hr />
      <div className="input-search-index">
        <InputGroup className="input-group-merge">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>
              <Search className="text-muted" size={14} />
            </InputGroupText>
          </InputGroupAddon>
          <Input
            type="text"
            id="search-input"
            placeholder="Cari Kode Modul, Nama Modul"
            onKeyDown={handleFilter}
            onChange={handleFilter}
          />
        </InputGroup>
      </div>
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          noHeader
          pagination
          columns={columns}
          className="react-dataTable"
          progressPending={isLoading}
          progressComponent={<TableLoader />}
          sortIcon={<ChevronDown size={10} />}
          paginationPerPage={moduleInfo?.limit}
          paginationDefaultPage={currentPage + 1}
          paginationComponent={CustomPagination}
          data={data}
        />
      )}
    </Card>
  );
};

export default ModuleTable;
