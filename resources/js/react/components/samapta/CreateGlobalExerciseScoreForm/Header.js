import clsx from "clsx";
import { Controller } from "react-hook-form";
import { FormFeedback, FormGroup, Input, Label } from "reactstrap";
import Select from "react-select";
import Flatpickr from "react-flatpickr";

import { selectionTypes, selectionYears } from "../../../config/samapta";

import "react-slidedown/lib/slidedown.css";
import "flatpickr/dist/themes/airbnb.css";
import styles from "./index.module.css";

const Header = ({ control }) => {
  return (
    <div className={clsx("card", "p-2", "mb-0")}>
      <div className={clsx("container text-center")}>
        <div className={clsx(styles["heading-title"])}>
          Tambah Nilai Latihan Global
        </div>
        <div className={clsx(styles["heading-subtitle"])}>
          Nilai yang diinputkan disini akan otomatis tersimpan pada kelas dari
          masing-masing siswa
        </div>
      </div>
      <div className={clsx("container", styles["form-grid"])}>
        <Controller
          name="selection_type"
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <FormGroup>
                <Label className={clsx("font-weight-bolder")}>
                  Tipe Seleksi
                </Label>
                <Select
                  {...field}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                    }),
                  }}
                  isSearchable
                  options={selectionTypes}
                  classNamePrefix="select"
                  className={clsx("react-select", {
                    "is-invalid": error && true,
                  })}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            );
          }}
        />
        <Controller
          name="selection_year"
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <FormGroup>
                <Label className={clsx("font-weight-bolder")}>
                  Tahun Ajaran
                </Label>
                <Select
                  {...field}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                    }),
                  }}
                  isSearchable
                  options={selectionYears}
                  classNamePrefix="select"
                  className={clsx("react-select", {
                    "is-invalid": error && true,
                  })}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            );
          }}
        />
        <Controller
          name="session_name"
          control={control}
          render={({ field, fieldState: { error } }) => {
            const { ref, ...rest } = field;
            return (
              <FormGroup className="flex-fill">
                <Label className={clsx("font-weight-bolder")}>Nama Sesi</Label>
                <Input
                  {...rest}
                  innerRef={ref}
                  invalid={error && true}
                  placeholder="Masukan Nama Sesi"
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            );
          }}
        />
        <Controller
          name="session_date"
          control={control}
          render={({
            field: { onChange, ref, value },
            fieldState: { error },
          }) => {
            return (
              <FormGroup>
                <Label className={clsx("font-weight-bolder")}>
                  Tanggal Pelaksanaan Sesi
                </Label>
                <Flatpickr
                  className={clsx("form-control", {
                    "is-invalid": error,
                  })}
                  style={{ backgroundColor: "#fff" }}
                  data-enable-time
                  ref={(ref) => ref}
                  value={value}
                  readOnly={false}
                  onChange={(date) =>
                    onChange(date[0] ? date[0].toISOString() : "")
                  }
                  placeholder="Pilih tanggal pelaksanaan sesi"
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            );
          }}
        />
      </div>
    </div>
  );
};

export default Header;
