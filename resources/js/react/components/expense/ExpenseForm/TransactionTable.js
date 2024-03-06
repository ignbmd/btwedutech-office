import classnames from "classnames";
import Select from "react-select";
import React, { useContext, useEffect, useState } from "react";
import { Minus, Plus } from "react-feather";
import Cleave from "cleave.js/react";
import { Controller } from "react-hook-form";
import {
  Badge,
  FormGroup,
  Button,
  Row,
  Table,
  Col,
  Input,
  FormFeedback,
} from "reactstrap";
import { ExpenseContext } from "../../../context/ExpenseContext";
import { getUserFromBlade } from "../../../utility/Utils";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const TransactionTable = ({ control, fields, handleAdd, handleRemove }) => {
  const { accountToOption, loadAccountToOption } = useContext(ExpenseContext);
  const [user, setUser] = useState(getUserFromBlade());

  useEffect(() => {
    loadAccountToOption(user?.branch_code);
  }, []);

  return (
    <Row className="mt-3">
      <Table size="sm">
        <thead>
          <tr>
            <th>Akun Biaya</th>
            {/* <th>Deskripsi</th> */}
            {/* <th>Pajak</th> */}
            <th>Jumlah</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={field.id}>
              <td>
                <Controller
                  isClearable
                  name={`transactions.${index}.account`}
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <FormGroup>
                      <Select
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                        options={accountToOption}
                        getOptionValue={(v) => v?.id}
                        getOptionLabel={({ name, branch_code, account_code }) =>
                          `${name} (${branch_code}) (${account_code})`
                        }
                        classNamePrefix="select"
                        className={classnames("react-select", {
                          "is-invalid": !!error,
                        })}
                        value={accountToOption.find((v) => v == value)}
                        onChange={(val) => onChange(val)}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />
              </td>
              {/* <td>
                <Controller
                  name={`transactions.${index}.description`}
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup>
                        <Input
                          {...rest}
                          rows="1"
                          className="p-0"
                          type="textarea"
                          innerRef={ref}
                          invalid={!!error}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              </td> */}
              {/* <td>
                <Controller
                  isClearable
                  name={`transactions.${index}.tax`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      {...field}
                      options={[]}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": error && true,
                      })}
                    />
                  )}
                />
              </td> */}
              <td>
                <Controller
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <Cleave
                        options={numeralOptions}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        {...field}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                  control={control}
                  name="custom_discount"
                  name={`transactions.${index}.amount`}
                  defaultValue=""
                />
              </td>
              <td>
                {fields.length > 1 ? (
                  <Button
                    className="btn-icon"
                    outline
                    color="primary"
                    size="sm"
                    onClick={() => handleRemove(index)}
                  >
                    <Minus size={16} />
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Col className="mt-1">
        <Button
          className="btn-icon"
          color="primary"
          size="sm"
          onClick={handleAdd}
        >
          <Plus size={16} /> Tambah Data
        </Button>
      </Col>
    </Row>
  );
};

export default TransactionTable;
