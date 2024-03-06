import { Spinner } from "reactstrap";

const SpinnerCenter = ({ color }) => {
  return (
    <div className="d-flex justify-content-center my-1">
      <Spinner color={color} />
    </div>
  );
};
export default SpinnerCenter;
