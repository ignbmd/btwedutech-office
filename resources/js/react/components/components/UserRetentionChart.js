import * as d3 from "d3";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Flatpickr from "react-flatpickr";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Label,
  Row,
} from "reactstrap";
import { Info } from "react-feather";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";

// import "flatpickr/dist/themes/airbnb.css";
import "./UserRetentionChart.css";
import SpinnerCenter from "../core/spinners/Spinner";
import { getUserRetention } from "../../services/dashboard/chart";

const packages = [
  {
    label: "Tryout Platinum",
    value: 441,
  },
  {
    label: "Tryout SKD Premium I",
    value: 446,
  },
  {
    label: "Tryout SKD Premium II",
    value: 447,
  },
];

const ranges = [
  {
    label: "Harian",
    value: "day",
  },
  {
    label: "Mingguan",
    value: "week",
  },
];

const isValidHex = (color) => {
  return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
};

const shadeColor = (color, percent) => {
  let currentPercent = percent > 100 ? 100 : percent;
  color = isValidHex(color) ? color : "#3f83a3"; //handling null color;
  currentPercent = 1.0 - Math.ceil(currentPercent / 10) / 10;
  const f = parseInt(color.slice(1), 16),
    t = currentPercent < 0 ? 0 : 255,
    p = currentPercent < 0 ? currentPercent * -1 : currentPercent,
    R = f >> 16,
    G = (f >> 8) & 0x00ff,
    B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
};

const FormSchema = yup.object().shape({
  packages: yup.object().required(),
  date: yup.array().of(yup.string()).required(),
});

const UserRetentionChart = () => {
  const [searchedValue, setSearchedValue] = useState();
  const [isSearching, setIsSearching] = useState(false);
  const {
    watch,
    control,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      range_type: {
        label: "Harian",
        value: "day",
      },
    },
    resolver: yupResolver(FormSchema),
  });

  const getRows = (data, packageId) => {
    var rows = [];
    var keys = Object.keys(data);
    var days = [];
    var percentDays = [];
    for (var key in keys) {
      if (data.hasOwnProperty(keys[key])) {
        days = data[keys[key]];
        percentDays.push(keys[key]);

        for (var i = 0; i < days.length; i++) {
          percentDays.push(days[i]);
        }
        rows.push(percentDays);
        percentDays = [];
      }
    }
    return rows;
  };

  const renderChart = async ({
    package_id,
    date_start,
    date_end,
    range_type,
  }) => {
    setIsSearching(true);
    const res = await getUserRetention({
      package_id,
      date_start,
      date_end,
      range_type,
    });

    setIsSearching(false);

    const data = res.data;
    let options = {};

    Object.entries(data).forEach(([key, value]) => {
      options["data"] = {
        ...options.data,
        [key]: value,
      };
    });

    const graphData = options.data || {};
    const container = d3
      .select("#user-retention-chart")
      .append("div")
      .attr("class", "box");

    const body = container.append("div").attr("class", "box-body");
    const table = body
      .append("table")
      .attr("class", "table table-bordered text-center");
    const rangeTitle = range_type === "day" ? "Day" : "Week";
    const rangeNumber = Object.keys(graphData)?.map(
      (_, idx) => `${rangeTitle} ${idx}`
    );
    const headData = ["Cohort", "Jumlah Yang Beli", ...rangeNumber];
    const tHead = table
      .append("thead")
      .append("tr")
      .attr("class", "retention-thead")
      .selectAll("td")
      .data(headData)
      .enter()
      .append("td")
      .attr("class", function (d, i) {
        if (i == 0) return "retention-date";
        else return "days";
      })
      .text(function (d) {
        return d;
      });

    const rowsData = getRows(graphData, package_id);
    let additionalRowsData = ["Total"];
    const firstRowLength = rowsData[0].length;

    Array(rowsData.length)
      .fill(null)
      .map((_, index) => {
        Array(firstRowLength)
          .fill(null)
          .map((_, indexRow) => {
            if (
              rowsData[index][indexRow] !== undefined &&
              additionalRowsData[indexRow] === undefined
            ) {
              additionalRowsData.push(rowsData[index][indexRow]);
            } else if (
              indexRow != 0 &&
              additionalRowsData[indexRow] !== undefined &&
              rowsData[index][indexRow] !== undefined
            ) {
              additionalRowsData[indexRow] += rowsData[index][indexRow];
            }
          });
      });

    console.log({ rowsData });
    Array(rowsData.length)
      .fill(null)
      .map((_, index) => {
        const startDividerIndex = index + 2;
        const dividerLength = rowsData[index].slice(2).length;
        const avgValue = additionalRowsData[startDividerIndex] / dividerLength;
        additionalRowsData[startDividerIndex] = avgValue.toFixed(1);
      });

    rowsData.push(additionalRowsData);

    const tBody = table.append("tbody");
    const rows = tBody.selectAll("tr").data(rowsData).enter().append("tr");
    rows
      .selectAll("td")
      .data(function (row, i) {
        return row;
      })
      .enter()
      .append("td")
      .attr("class", function (d, i) {
        if (i == 0) return "retention-date";
        else return "days";
      })
      .attr("style", function (d, i) {
        if (i > 1)
          return `background-color : ${shadeColor("#00c4b4", d)}; color: ${
            d >= 80 ? "#fff" : "#000"
          };`;
      })
      .append("div")
      .attr("data-toggle", "tooltip")
      .text((d) => d);
  };

  const onSearch = () => {
    const { packages, range_type, date } = getValues();
    setSearchedValue({
      package_id: packages?.value,
      date_start: date[0],
      date_end: date[1],
      range_type: range_type.value,
    });
  };

  useEffect(() => {
    if (
      (searchedValue?.package_id,
      searchedValue?.date_start,
      searchedValue?.date_end,
      searchedValue?.range_type)
    ) {
      renderChart({
        package_id: searchedValue?.package_id,
        date_start: searchedValue?.date_start,
        date_end: searchedValue?.date_end,
        range_type: searchedValue?.range_type,
      });
    }
  }, [
    searchedValue?.package_id,
    searchedValue?.date_start,
    searchedValue?.date_end,
    searchedValue?.range_type,
  ]);

  return (
    <>
      <CardHeader>
        <CardTitle>
          Retensi akses modul per minggu berdasarkan pembelian paket
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit(onSearch)}>
          <Row>
            <Col md={4}>
              <Controller
                name="packages"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill mt-1">
                      <Label className="form-label font-weight-bolder">
                        Pilih Paket
                      </Label>
                      <Select
                        {...field}
                        isSearchable={false}
                        options={packages}
                        classNamePrefix="select"
                        className={classnames("react-select", {
                          "is-invalid": error && true,
                        })}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />
            </Col>
            <Col md={4}>
              <Controller
                name="date"
                control={control}
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => {
                  return (
                    <FormGroup className="flex-fill mt-1">
                      <Label className="form-label font-weight-bolder">
                        Pilih Range Tanggal
                      </Label>
                      <Flatpickr
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        ref={ref}
                        value={value}
                        options={{
                          mode: "range",
                          allowInput: true,
                        }}
                        placeholder="Pilih range tanggal"
                        onChange={(date) => {
                          if (date[0] && date[1]) {
                            onChange([
                              moment(date[0]).format("Y-MM-DD"),
                              moment(date[1]).format("Y-MM-DD"),
                            ]);
                          } else {
                            // onChange(undefined);
                          }
                        }}
                      />
                    </FormGroup>
                  );
                }}
              />
            </Col>
            <Col md={2} className="d-flex align-items-end my-1">
              <Controller
                name="range_type"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill my-0">
                      <Select
                        {...field}
                        isSearchable={false}
                        options={ranges}
                        classNamePrefix="select"
                        className={classnames("react-select", {
                          "is-invalid": error && true,
                        })}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />
            </Col>
            <Col md={2} className="d-flex align-items-end my-1">
              <Button type="submit" color="gradient-primary">
                Cari
              </Button>
            </Col>
          </Row>
        </Form>
        {isSearching ? (
          <SpinnerCenter />
        ) : searchedValue ? (
          <div className="user-retention-container">
            <div id="user-retention-chart"></div>
          </div>
        ) : (
          <Alert color="primary">
            <div className="alert-body">
              <p>
                <Info size={18} className="mr-75" /> Harap memilih paket & range
                tanggal terlebih dahulu
              </p>
            </div>
          </Alert>
        )}
      </CardBody>
    </>
  );
};

export default UserRetentionChart;
