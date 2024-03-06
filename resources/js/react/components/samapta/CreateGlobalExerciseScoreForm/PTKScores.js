import clsx from "clsx";
import styles from "./index.module.css";
import { Controller } from "react-hook-form";
import { FormFeedback, FormGroup, Input, Label } from "reactstrap";

const PTKScores = ({ index, control }) => {
  const handleOnChange = (field, e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      field.onChange(e.target.value);
    }
  };

  return (
    <div className={clsx(styles["score-form-container"])}>
      <Controller
        name={`students.${index}.scores.run`}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { ref, ...rest } = field;
          return (
            <FormGroup>
              <Label>Lari 12 Menit</Label>
              <Input
                {...rest}
                innerRef={ref}
                invalid={Boolean(error?.message)}
                placeholder="Jarak (m)"
                onChange={(e) => {
                  handleOnChange(field, e);
                }}
              />
              <FormFeedback>{error?.message}</FormFeedback>
            </FormGroup>
          );
        }}
      />

      <Controller
        name={`students.${index}.scores.sit_up`}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { ref, ...rest } = field;
          return (
            <FormGroup>
              <Label>Sit Up</Label>
              <Input
                {...rest}
                innerRef={ref}
                invalid={Boolean(error?.message)}
                placeholder="Jumlah (x)"
                onChange={(e) => {
                  handleOnChange(field, e);
                }}
              />
              <FormFeedback>{error?.message}</FormFeedback>
            </FormGroup>
          );
        }}
      />

      <Controller
        name={`students.${index}.scores.push_up`}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { ref, ...rest } = field;
          return (
            <FormGroup>
              <Label>Push Up</Label>
              <Input
                {...rest}
                innerRef={ref}
                invalid={Boolean(error?.message)}
                placeholder="Jumlah (x)"
                onChange={(e) => {
                  handleOnChange(field, e);
                }}
              />
              <FormFeedback>{error?.message}</FormFeedback>
            </FormGroup>
          );
        }}
      />

      {/* <Controller
        name={`students.${index}.scores.pull_up`}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { ref, ...rest } = field;
          return (
            <FormGroup>
              <Label>Pull Up</Label>
              <Input
                {...rest}
                innerRef={ref}
                invalid={Boolean(error?.message)}
                placeholder="Jumlah (x)"
                onChange={(e) => {
                  handleOnChange(field, e);
                }}
              />
              <FormFeedback>{error?.message}</FormFeedback>
            </FormGroup>
          );
        }}
      /> */}

      <Controller
        name={`students.${index}.scores.shuttle`}
        control={control}
        render={({ field, fieldState: { error } }) => {
          const { ref, ...rest } = field;
          return (
            <FormGroup>
              <Label>Shuttle Run</Label>
              <Input
                {...rest}
                innerRef={ref}
                invalid={Boolean(error?.message)}
                placeholder="Waktu (ms)"
                onChange={(e) => {
                  handleOnChange(field, e);
                }}
              />
              <FormFeedback>{error?.message}</FormFeedback>
            </FormGroup>
          );
        }}
      />
    </div>
  );
};

export default PTKScores;
