import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";
import "./AccessCode.css";
import pusher from "pusher-js";
import { getCsrf } from "../../utility/Utils";
import { useEffect, useState } from "react";
import SpinnerCenter from "../../components/core/spinners/Spinner";

const stageProgram = {
  PTK: "SKD",
  PTN: "UTBK",
  CPNS: "CPNS",
};

const getBranchDetail = () => {
  const dom = document.getElementById("branchDetail");
  return JSON.parse(dom.innerText);
};

const getStage = () => {
  const dom = document.getElementById("stage");
  return JSON.parse(dom.innerText);
};

const getClassroom = () => {
  const dom = document.getElementById("classroom");
  return JSON.parse(dom.innerText);
};

const getWsAppKey = () => {
  const dom = document.getElementById("wsAppKey");
  return dom.innerText;
};

const getWsAppCluster = () => {
  const dom = document.getElementById("wsAppCluster");
  return dom.innerText;
};

const getWsAppHost = () => {
  const dom = document.getElementById("wsAppHost");
  return dom.innerText;
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const remainingSeconds = time % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const generateOTP = () => {
  const otpLength = 6;
  let otp = "";

  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
  }

  return otp;
};

const formatOTPNumber = (numberString) => {
  // Use a regular expression to match every 3-digit number
  // and replace it with the same number with spaces added
  return numberString.replace(/\d{3}(?=\d)/g, function (match) {
    return match + " ";
  });
};

const host = window.location.origin;
const hostname = window.location.hostname;
const isLocalhost = hostname.includes("localhost");
const clientConfig = {
  forceTLS: true,
};

const client = new pusher(getWsAppKey(), {
  wsHost: getWsAppHost(),
  cluster: getWsAppCluster(),
  forceTLS: clientConfig.forceTLS,
  encrypted: false,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  userAuthentication: {
    endpoint: `${host}/api/ws/login`,
    headers: {
      "X-CSRF-Token": getCsrf(),
    },
  },
  channelAuthorization: {
    endpoint: `${host}/api/ws/authorize`,
    headers: {
      "X-CSRF-Token": getCsrf(),
    },
  },
});

const branch = getBranchDetail();
const stage = getStage();
const classroom = getClassroom();
const channelName = `private-totp.${branch.code}.${stage.session}`;
const channel = client.subscribe(channelName);

const AccessCode = () => {
  const [otp, setOtp] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    client.signin();
    // client.bind("pusher:signin_success", () => {
    // var channel = client.subscribe(channelName);
    // channel.bind("pusher:subscription_succeeded", () => {
    //   channel.bind("totp-updated", (data) => {
    //     const currentUnixTimestamp = Math.floor(Date.now() / 1000);
    //     const differenceInSeconds = +data.expired_at - currentUnixTimestamp;
    //     const newOTP = {
    //       otpNumber: generateOTP(),
    //       expiredAt: differenceInSeconds,
    //     };
    //     setOtp(newOTP);
    //     setRemainingTime(differenceInSeconds);
    //   });
    // });
    // channel.bind("pusher:subscription_error", () => {
    //   location.reload();
    // });
    // });
    channel.bind("pusher:subscription_succeeded", () => {
      channel.bind("totp-updated", (data) => {
        const currentUnixTimestamp = Math.floor(Date.now() / 1000);
        const differenceInSeconds = +data.expired_at - currentUnixTimestamp;
        const newOTP = {
          otpNumber: +data.token,
          expiredAt: differenceInSeconds,
        };
        setOtp(newOTP);
        setRemainingTime(differenceInSeconds);
      });
    });
    channel.bind("pusher:subscription_error", () => {
      location.reload();
    });
    client.bind("pusher:error", (error) => {
      console.error("An error has been occured", error);
      location.reload();
    });

    return () => {
      channel.unbind();
      client.unsubscribe(channelName);
      client.disconnect();
    };
  }, []);

  useEffect(() => {
    if (remainingTime && remainingTime >= 0) {
      const timer = setInterval(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  return (
    <Row
      className="justify-content-center align-items-center"
      style={{ minHeight: "100vh", marginLeft: 0, marginRight: 0 }}
    >
      <Col sm="12" className="p-0">
        <div className="card mx-auto my-0" style={{ width: "90%" }}>
          <div className="card-body" style={{ padding: "5rem" }}>
            <div className="row justify-content-center align-items-center flex-column gap-30">
              <div className="text-center">
                <h4>{branch.name}</h4>
                <div>
                  UKA STAGE Program {stage?.stage_type ?? "REGULER"}{" "}
                  {classroom?.title}
                </div>
                <div className="font-weight-bold">
                  UKA {stageProgram[stage.type]} LEVEL {stage.level} | SESI{" "}
                  {stage.session}
                </div>
              </div>
              <div className="otp gap-20">
                {otp ? (
                  <div className="otp-number">
                    {formatOTPNumber(otp.otpNumber.toString())}
                  </div>
                ) : (
                  <SpinnerCenter />
                )}
                {otp ? (
                  <div className="otp-description">
                    Kode Akses akan diperbarui dalam{" "}
                    <span className="otp-timer">
                      {formatTime(remainingTime)}
                    </span>{" "}
                    Detik
                  </div>
                ) : null}
              </div>
              {otp ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    channel.unbind();
                    client.unsubscribe(channelName);
                    window.location.replace(
                      "/akses-uka-stages/generate-kode-akses"
                    );
                  }}
                >
                  Tutup Akses
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default AccessCode;

if (document.getElementById("container")) {
  ReactDOM.render(<AccessCode />, document.getElementById("container"));
}
