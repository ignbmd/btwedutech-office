import axios from "axios";
import * as yup from "yup";
import { useRef } from "react";
import { Fragment } from "react";
import classnames from "classnames";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Save } from "react-feather";
import {
  Row,
  Col,
  Form,
  Label,
  Input,
  Button,
  FormGroup,
  Table,
  CustomInput,
} from "reactstrap";

import { isObjEmpty } from "../../../utility/Utils";
import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";

const ChecklistForm = ({
  item,
  stepper,
  useFormProps,
}) => {
  const {
    control,
    register,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useFormProps;

  const onSubmit = () => {
    trigger();
    if (isObjEmpty(errors)) {
      stepper.next();
      window.scrollTo(0,0)
    }
  };

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0 font-weight-bolder">{item.text}</h5>
        <small className="text-muted">
          {item.description ? item.description : "Inputkan rincian kesehatan"}
        </small>
      </div>
      <AvForm onSubmit={handleSubmit(onSubmit)} className={classnames("")}>
        <Table borderless striped responsive className="mt-1">
          <thead className="thead-light">
            <tr>
              <th>No</th>
              <th>Rincian</th>
              <th>
              Status
              </th>
            </tr>
          </thead>
          <tbody>
            {item.inspections?.map((detail, detailIndex) => {
              return (
                <tr key={detailIndex}>
                  <td>{detailIndex + 1}</td>
                  <td>{detail.name}</td>
                  <td>
                    <AvRadioGroup
                      name={`${detail.area}-${detail._id}`}
                      {...register(`${detail.area}-${detail._id}`)}
                      className="mt-1"
                    >
                      <div className="d-flex">
                        <AvRadio
                          className="mr-1"
                          customInput
                          label="YA"
                          value="yes"
                        />
                        <AvRadio
                          customInput
                          label="TIDAK"
                          value="no"
                        />
                      </div>
                    </AvRadioGroup>
                  </td>
                  {/* <td>
                    <Controller
                      name={`${detail.area}-${detail._id}`}
                      defaultValue=""
                      control={control}
                      render={({ field }) => {
                        const { ref, ...rest } = field;
                        return (
                          <CustomInput
                            {...rest}
                            type="radio"
                            value="yes"
                            id={`${detail.area}-${detailIndex}-1`}
                            label=""
                            innerRef={ref}
                          />
                        );
                      }}
                    />
                  </td>
                  <td>
                    <Controller
                      name={`${detail.area}-${detail._id}`}
                      defaultValue=""
                      control={control}
                      render={({ field }) => {
                        const { ref, ...rest } = field;
                        return (
                          <CustomInput
                            {...rest}
                            type="radio"
                            value="no"
                            id={`${detail.area}-${detailIndex}-2`}
                            label=""
                            innerRef={ref}
                          />
                        );
                      }}
                    />
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </Table>

        <div className="d-flex justify-content-between mt-2">
          <Button
            color="secondary"
            className="btn-prev"
            outline
            onClick={() => stepper.previous()}
          >
            <ArrowLeft size={14} className="align-middle mr-sm-25 mr-0" />
            <span className="align-middle d-sm-inline-block d-none">
              Sebelumnya
            </span>
          </Button>
          <Button type="submit" color="primary" className="btn-next">
            <span className="align-middle d-sm-inline-block d-none">
              Lanjutkan
            </span>
            <ArrowRight size={14} className="align-middle ml-sm-25 ml-0" />
          </Button>
        </div>
      </AvForm>
    </Fragment>
  );
};

export default ChecklistForm;
