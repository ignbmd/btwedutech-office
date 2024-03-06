import Axios from "axios";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { PlusSquare, MinusSquare } from "react-feather";
import React, { useEffect, useState, useRef } from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink, Card } from "reactstrap";

import BranchDebt from "./BranchDebt";
import BranchReceivables from "./BranchReceivables";
import {
  getBranchDebt,
  getCentralReceivableHistory,
} from "../../data/branch-debt-table";
import {
  getBranchReceivable,
  getCentralPayDebtHistory,
} from "../../data/branch-credit-table";

const FormSchema = yup.object().shape({
  status: yup.object().required(),
});

const BranchDebtAndCreditIndex = () => {
  const [debt, setDebt] = useState();
  const [receivable, setReceivable] = useState();
  const [centralPayDebtHistories, setCentralPayDebtHistories] = useState();
  const [centralCollectReceivableHistory, setCentralCollectReceivableHistory] =
    useState();
  const [tabActive, setTabActive] = useState("DEBT");
  const { control, watch } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      status: { label: "Semua", value: "" },
    },
  });

  const source = Axios.CancelToken.source();
  const isCanceled = useRef(false);

  const { status } = watch();

  const toggle = (tab) => {
    if (tabActive !== tab) {
      setTabActive(tab);
    }
  };

  const handleUpdateDebtHistory = async () => {
    const updatedRows = await getCentralReceivableHistory(status.value, {
      cancelToken: source.token,
    });
    if (!isCanceled.current) {
      setCentralCollectReceivableHistory(updatedRows);
    }
  };

  const setRows = async (type) => {
    if (type === "DEBT") {
      const data = await getBranchDebt();
      setDebt(data);
      handleUpdateDebtHistory();
    } else {
      const data = await getBranchReceivable();
      setReceivable(data);
      if (Object.keys(data).length > 0) {
        const historyData = await getCentralPayDebtHistory(data.account_id);
        const formattedHistoryData = historyData.map((item) => ({
          ...item,
          payment_method: item.source_account?.name,
          proof_file: item.document?.[0]?.path,
        }));
        setCentralPayDebtHistories(formattedHistoryData);
      } else {
        setCentralPayDebtHistories([]);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (tabActive === "DEBT") {
        setCentralCollectReceivableHistory(undefined);
        handleUpdateDebtHistory();
      }
    })();

    return () => {
      source.cancel();
    };
  }, [status.value]);

  useEffect(() => {
    (async () => {
      if (centralPayDebtHistories && receivable) return;
      setRows(tabActive);
    })();
  }, [tabActive]);

  return (
    <Card>
      <Nav tabs className="mb-0">
        <NavItem>
          <NavLink
            className="py-2"
            active={tabActive === "DEBT"}
            onClick={() => {
              toggle("DEBT");
            }}
          >
            <MinusSquare size={14} />
            <span className="align-middle">Hutang ke Pusat</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className="py-2"
            active={tabActive === "RECEIVABLE"}
            onClick={() => {
              toggle("RECEIVABLE");
            }}
          >
            <PlusSquare size={14} />
            <span className="align-middle">Piutang ke Pusat</span>
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className="pb-50" activeTab={tabActive}>
        <TabPane tabId="DEBT">
          <BranchDebt
            control={control}
            debt={debt}
            histories={centralCollectReceivableHistory}
          />
        </TabPane>
        <TabPane tabId="RECEIVABLE">
          <BranchReceivables
            receivable={receivable}
            histories={centralPayDebtHistories}
          />
        </TabPane>
      </TabContent>
    </Card>
  );
};

export default BranchDebtAndCreditIndex;
