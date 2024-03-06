import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { getCompetitionMapList } from "../../services/comp-map/comp-map";

const CompetitionMapTable = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getCompetitionMapList();
        setData(data);
        setIsLoading(false);
      } catch (error) {
        setData(null);
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="overflow-auto mx-auto px-2 py-4">
      <CardHeader>
        <h3>Peta Persaingan Tryout SKD</h3>
      </CardHeader>
      <CardBody>
        <div className="mt-2">
          <p>Nama : Dwiky Chandra Hidayat</p>
          <p>Email : dwikychandra21@gmail.com</p>
          <p>Tryout : Tryout Sosialisasi #1 - 01 Juli 2022</p>
        </div>
        <div className="mt-3 d-flex justify-content-between">
          <h5>Hasil Tryout</h5>
          <button className="btn btn-danger">Unduh PDF</button>
        </div>
        <table className="table mt-2 text-center table-bordered">
          <thead>
            <tr>
              <th scope="col">TWK</th>
              <th scope="col">TIU</th>
              <th scope="col">TKP</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-danger">80</td>
              <td className="text-danger">90</td>
              <td className="text-success">120</td>
              <td>290</td>
              <td className="text-danger">Tidak Lulus</td>
            </tr>
            <tr>
              <td className="text-danger">90</td>
              <td className="text-danger">80</td>
              <td className="text-success">150</td>
              <td>320</td>
              <td className="text-danger">Tidak Lulus</td>
            </tr>
            <tr>
              <td className="text-success">120</td>
              <td className="text-success">110</td>
              <td className="text-success">120</td>
              <td>350</td>
              <td className="text-success">Lulus</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-3 d-flex justify-content-between">
          <h5>Ranking SKD</h5>
        </div>
        <table className="table mt-2 table-bordered table-striped">
          <thead>
            <tr>
              <th scope="col">Sekolah</th>
              <th scope="col">Jurusan</th>
              <th scope="col">Kuota</th>
              <th scope="col">Ranking</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>POLITEKNIK TRANSPORTASI DARAT INDONESIA - STTD</td>
              <td>D-III MANAJEMEN TRANSPORTASI PERKERETAAPIAN</td>
              <td>30</td>
              <td>100</td>
            </tr>
            <tr>
              <td>POLITEKNIK TRANSPORTASI DARAT INDONESIA - STTD</td>
              <td>D-III MANAJEMEN TRANSPORTASI PERKERETAAPIAN</td>
              <td>40</td>
              <td>200</td>
            </tr>
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};

export default CompetitionMapTable;
