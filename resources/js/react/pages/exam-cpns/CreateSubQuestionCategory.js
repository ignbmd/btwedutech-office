import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditSubQuestionCategoryForm from "../../components/exam-cpns/sub-question-category/CreateEditSubQuestionCategoryForm";

const CreateSubQuestionCategory = () => {
    return (
        <Row>
            <Col md="12">
                <CreateEditSubQuestionCategoryForm type="create"/>
            </Col>
        </Row>
    );
}

export default CreateSubQuestionCategory;

if (document.getElementById("create-sub-question-category-container")){
    ReactDOM.render(<CreateSubQuestionCategory />, document.getElementById("create-sub-question-category-container"));
}

