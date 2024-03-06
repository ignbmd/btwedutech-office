import clsx from "clsx";
import { Controller } from "react-hook-form";
import { FormFeedback, FormGroup, Input, Label } from "reactstrap";
import Flatpickr from "react-flatpickr";

import "react-slidedown/lib/slidedown.css";
import "flatpickr/dist/themes/airbnb.css";
import styles from "./index.module.css";

const Header = ({ control, errors }) => {
  return (
    <div className={clsx("card", "p-2")}>
      <div className={clsx("container text-center")}>
        <div className={clsx(styles["heading-title"])}>Tambah Sesi Latihan</div>
      </div>
      <div className={clsx("container", styles["form-grid"])}>
        <Controller
          name="session_name"
          control={control}
          render={({ field, fieldState: { error } }) => {
            const { ref, ...rest } = field;
            return (
              <FormGroup className="flex-fill">
                <Label className={clsx("font-weight-bolder")}>Label Sesi</Label>
                <Input
                  {...rest}
                  innerRef={ref}
                  invalid={error && true}
                  placeholder="Masukan Label Sesi"
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
