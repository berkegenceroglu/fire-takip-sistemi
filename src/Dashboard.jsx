import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
function Dashboard() {
  const dashboardOlustur = async () => {

  const querySnapshot = await getDocs(
    collection(db, "fireKayitlari")
  );

  const tumKayitlar = querySnapshot.docs.map(
    (doc) => ({
      id: doc.id,
      ...doc.data(),
    })
  );
  const formatTarih = (tarih) => {
  const [yil, ay, gun] = tarih.split("-");

  return `${gun}.${ay}.${yil}`;
};

  const baslangic = formatTarih(baslangicTarih);
  const bitis = formatTarih(bitisTarih);

  const filtrelenmisKayitlar = tumKayitlar.filter(
  (k) => k.tarih >= baslangic && k.tarih <= bitis
);
  setRaporVerileri(filtrelenmisKayitlar);
  const toplam = filtrelenmisKayitlar.reduce(
  (toplam, kayit) =>
    toplam + Number(kayit.toplamFire || 0),
  0
);

setToplamHurda(toplam);
const uretim = filtrelenmisKayitlar.reduce(
  (toplam, kayit) =>
    toplam + Number(kayit.gerceklesen || 0),
  0
);

setToplamUretim(uretim);

const oran =
  uretim > 0
    ? ((toplam / uretim) * 100).toFixed(2)
    : 0;

setHurdaOrani(oran);
  console.log(
  "Bulunan kayıt:",
  filtrelenmisKayitlar.length
  );
  const hatHurdalari = {};

filtrelenmisKayitlar.forEach((kayit) => {
  const hat = kayit.hat || "Bilinmiyor";

  hatHurdalari[hat] =
    (hatHurdalari[hat] || 0) +
    Number(kayit.toplamFire || 0);
});

  let enKotuHat = "";
  let enKotuHurda = 0;

Object.entries(hatHurdalari).forEach(
  ([hat, hurda]) => {
    if (hurda > enKotuHurda) {
      enKotuHurda = hurda;
      enKotuHat = hat;
    }
  }
);

setEnFazlaHurdaHat(enKotuHat);
setEnFazlaHurdaAdet(enKotuHurda);
const hatPerformanslari = {};

filtrelenmisKayitlar.forEach((kayit) => {
  const hat = kayit.hat || "Bilinmiyor";

  if (!hatPerformanslari[hat]) {
    hatPerformanslari[hat] = {
      uretim: 0,
      hurda: 0,
    };
  }

  hatPerformanslari[hat].uretim +=
    Number(kayit.gerceklesen || 0);

  hatPerformanslari[hat].hurda +=
    Number(kayit.toplamFire || 0);
});

let enKotuHatPerformans = "";
let enYuksekOran = 0;

Object.entries(hatPerformanslari).forEach(
  ([hat, veri]) => {

    const oran =
      veri.uretim > 0
        ? (veri.hurda / veri.uretim) * 100
        : 0;

    if (oran > enYuksekOran) {
      enYuksekOran = oran;
      enKotuHatPerformans = hat;
    }
  }
);

setEnKotuPerformansHat(
  enKotuHatPerformans
);

setEnKotuPerformansOran(
  enYuksekOran.toFixed(2)
);
const dagilim = [
  {
    name: "Şişe",
    value: filtrelenmisKayitlar.reduce(
      (t, k) => t + Number(k.sise || 0),
      0
    ),
  },
  {
    name: "Valf",
    value: filtrelenmisKayitlar.reduce(
      (t, k) => t + Number(k.valf || 0),
      0
    ),
  },
  {
    name: "Kapak",
    value: filtrelenmisKayitlar.reduce(
      (t, k) => t + Number(k.kapak || 0),
      0
    ),
  },
  {
    name: "Separatör",
    value: filtrelenmisKayitlar.reduce(
      (t, k) => t + Number(k.separator || 0),
      0
    ),
  },
  {
    name: "Kutu",
    value: filtrelenmisKayitlar.reduce(
      (t, k) => t + Number(k.kutu || 0),
      0
    ),
  },
  {
    name: "Yüzük",
    value: filtrelenmisKayitlar.reduce(
      (t, k) => t + Number(k.yuzuk || 0),
      0
    ),
  },
  {
    name: "Etiket",
    value: filtrelenmisKayitlar.reduce(
      (t, k) => t + Number(k.etiket || 0),
      0
    ),
  },
];

setHurdaDagilimi(dagilim);
const sirali = [...dagilim]
  .sort((a, b) => b.value - a.value);

const toplamHurdaPareto =
  sirali.reduce(
    (toplam, item) => toplam + item.value,
    0
  );

let kume = 0;

const pareto = sirali.map((item) => {

  kume += item.value;

  return {
    ...item,
    kumulatif:
      (
        (kume / toplamHurdaPareto) *
        100
      ).toFixed(1),
  };
});

setParetoVerisi(pareto);
const hatlar = {};

filtrelenmisKayitlar.forEach((kayit) => {

  const hat = kayit.hat || "Bilinmiyor";

  if (!hatlar[hat]) {
    hatlar[hat] = {
      hat,
      uretim: 0,
      hurda: 0,
    };
  }

  hatlar[hat].uretim +=
    Number(kayit.gerceklesen || 0);

  hatlar[hat].hurda +=
    Number(kayit.toplamFire || 0);

});

const hatListesi =
  Object.values(hatlar).map((hat) => ({

    ...hat,

    oran:
      hat.uretim > 0
        ? (
            (hat.hurda / hat.uretim) *
            100
          ).toFixed(2)
        : 0,

  }));

hatListesi.sort(
  (a, b) => b.oran - a.oran
);

setHatAnalizi(hatListesi);
const gunler = {};

filtrelenmisKayitlar.forEach((kayit) => {

  const tarih = kayit.tarih;

  if (!gunler[tarih]) {

    gunler[tarih] = {
      tarih,
      uretim: 0,
      hurda: 0,
    };

  }

  gunler[tarih].uretim +=
    Number(kayit.gerceklesen || 0);

  gunler[tarih].hurda +=
    Number(kayit.toplamFire || 0);

});

const trendVerisi =
  Object.values(gunler).map((gun) => ({

    tarih: gun.tarih,

    oran:
      gun.uretim > 0
        ? (
            (gun.hurda / gun.uretim) *
            100
          ).toFixed(2)
        : 0,

  }));

trendVerisi.sort((a, b) => {

  const [g1, a1, y1] =
    a.tarih.split(".");

  const [g2, a2, y2] =
    b.tarih.split(".");
const excelIndir = () => {

  const wb = XLSX.utils.book_new();

  // SAYFA 1 - Yönetici Özeti

  const ozet = [
    ["Hurda Performans Dashboardu"],
    [],
    ["Toplam Üretim", toplamUretim],
    ["Toplam Hurda", toplamHurda],
    ["Hurda Oranı (%)", hurdaOrani],
    ["En Kötü Performans", enKotuPerformansHat],
    ["En Kötü Performans (%)", enKotuPerformansOran],
    ["En Fazla Hurda", enFazlaHurdaHat],
    ["En Fazla Hurda Adet", enFazlaHurdaAdet],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(ozet);

  XLSX.utils.book_append_sheet(
    wb,
    ws1,
    "Yönetici Özeti"
  );

  // SAYFA 2 - Hurda Dağılımı

  const ws2 = XLSX.utils.json_to_sheet(
    hurdaDagilimi
  );

  XLSX.utils.book_append_sheet(
    wb,
    ws2,
    "Hurda Dağılımı"
  );

  // SAYFA 3 - Pareto

  const ws3 = XLSX.utils.json_to_sheet(
    paretoVerisi
  );

  XLSX.utils.book_append_sheet(
    wb,
    ws3,
    "Pareto Analizi"
  );

  // SAYFA 4 - Hat Analizi

  const ws4 = XLSX.utils.json_to_sheet(
    hatAnalizi
  );

  XLSX.utils.book_append_sheet(
    wb,
    ws4,
    "Hat Analizi"
  );

  // SAYFA 5 - Günlük Trend

  const ws5 = XLSX.utils.json_to_sheet(
    gunlukTrend
  );

  XLSX.utils.book_append_sheet(
    wb,
    ws5,
    "Günlük Trend"
  );

  XLSX.writeFile(
    wb,
    `HurdaDashboard_${baslangicTarih}_${bitisTarih}.xlsx`
  );
};
  return (
    new Date(y1, a1 - 1, g1) -
    new Date(y2, a2 - 1, g2)
  );

});

setGunlukTrend(trendVerisi);
};
  const [baslangicTarih, setBaslangicTarih] =
    useState("");

  const [bitisTarih, setBitisTarih] =
    useState("");
  const [raporVerileri, setRaporVerileri] =
    useState([]);
  const [toplamHurda, setToplamHurda] =
  useState(0);
  const [toplamUretim, setToplamUretim] =
  useState(0);

  const [hurdaOrani, setHurdaOrani] =
  useState(0);
  const [enFazlaHurdaHat, setEnFazlaHurdaHat] =
  useState("");
  const [enKotuPerformansHat, setEnKotuPerformansHat] =
  useState("");

  const [enKotuPerformansOran, setEnKotuPerformansOran] =
  useState(0);
  const [enFazlaHurdaAdet, setEnFazlaHurdaAdet] =
  useState(0);
  const [hurdaDagilimi, setHurdaDagilimi] =
  useState([]);
  const [paretoVerisi, setParetoVerisi] =
  useState([]);
  const [hatAnalizi, setHatAnalizi] =
  useState([]);
  const [gunlukTrend, setGunlukTrend] =
  useState([]);
  const ilkUcHurda = paretoVerisi
  .slice(0, 3)
  .map((x) => x.name)
  .join(", ");
  const COLORS = [
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#f97316",
  "#ec4899",
  "#22c55e",
];
const excelIndir = () => {

  const wb = XLSX.utils.book_new();

  const ozet = [
    ["Hurda Performans Dashboardu"],
    [],
    ["Toplam Üretim", toplamUretim],
    ["Toplam Hurda", toplamHurda],
    ["Hurda Oranı (%)", hurdaOrani],
    ["En Kötü Performans", enKotuPerformansHat],
    ["En Kötü Performans (%)", enKotuPerformansOran],
    ["En Fazla Hurda", enFazlaHurdaHat],
    ["En Fazla Hurda Adet", enFazlaHurdaAdet],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(ozet);
  XLSX.utils.book_append_sheet(
    wb,
    ws1,
    "Yönetici Özeti"
  );

  const ws2 = XLSX.utils.json_to_sheet(
    hurdaDagilimi
  );
  XLSX.utils.book_append_sheet(
    wb,
    ws2,
    "Hurda Dağılımı"
  );

  const ws3 = XLSX.utils.json_to_sheet(
    paretoVerisi
  );
  XLSX.utils.book_append_sheet(
    wb,
    ws3,
    "Pareto Analizi"
  );

  const ws4 = XLSX.utils.json_to_sheet(
    hatAnalizi
  );
  XLSX.utils.book_append_sheet(
    wb,
    ws4,
    "Hat Analizi"
  );

  const ws5 = XLSX.utils.json_to_sheet(
    gunlukTrend
  );
  XLSX.utils.book_append_sheet(
    wb,
    ws5,
    "Günlük Trend"
  );

  XLSX.writeFile(
    wb,
    `HurdaDashboard_${baslangicTarih}_${bitisTarih}.xlsx`
  );
};

  return (
    <div
  className="min-h-screen bg-gray-100 p-6"
>

      <div className="max-w-7xl mx-auto bg-linear-to-br from-slate-50 via-white to-blue-50 rounded-3xl shadow-2xl p-10 border border-slate-200">

        <div className="text-center mb-10">
  <h1 className="text-4xl font-extrabold text-gray-900 tracking-wide">
    HURDA PERFORMANS DASHBOARDU
  </h1>

  <p className="text-gray-500 mt-3 text-lg">
    Tarih aralığını seçerek performans analizini oluşturun.
  </p>
</div>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="font-semibold text-gray-700 mb-2 block">
              Başlangıç Tarihi
            </label>

            <input
              type="date"
              value={baslangicTarih}
              onChange={(e) =>
                setBaslangicTarih(
                  e.target.value
                )
              }
              className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="font-semibold">
              Bitiş Tarihi
            </label>

            <input
              type="date"
              value={bitisTarih}
              onChange={(e) =>
                setBitisTarih(
                  e.target.value
                )
              }
              className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-blue-500 focus:outline-none transition"
            />
          </div>

        </div>

        <button
          onClick={dashboardOlustur}
          className="w-full mt-8 bg-linear-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-[1.01] transition"
        >
          Dashboard Oluştur
        </button>
        <button
  onClick={excelIndir}
  className="w-full mt-4 bg-green-600 text-white p-4 rounded-2xl font-bold hover:bg-green-700"
>
  📊 Excel İndir
</button>

{raporVerileri.length > 0 && (

  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8">

    <div className="bg-white rounded-3xl shadow-xl p-6 border">
      <p className="text-gray-500 text-sm">
        TOPLAM ÜRETİM
      </p>

      <h2 className="text-4xl font-bold text-blue-600 mt-2">
        {toplamUretim.toLocaleString("tr-TR")}
      </h2>

      <p className="text-gray-500 mt-2">
        adet
      </p>
    </div>

    <div className="bg-white rounded-3xl shadow-xl p-6 border">
      <p className="text-gray-500 text-sm">
        TOPLAM HURDA
      </p>

      <h2 className="text-4xl font-bold text-red-600 mt-2">
        {toplamHurda.toLocaleString("tr-TR")}
      </h2>

      <p className="text-gray-500 mt-2">
        adet
      </p>
    </div>

    <div className="bg-white rounded-3xl shadow-xl p-6 border">
      <p className="text-gray-500 text-sm">
        HURDA ORANI
      </p>

      <h2 className="text-4xl font-bold text-orange-500 mt-2">
        %{hurdaOrani}
      </h2>

      <p className="text-gray-500 mt-2">
        toplam üretime göre
      </p>
    </div>

    <div className="bg-white rounded-3xl shadow-xl p-6 border">
  <p className="text-gray-500 text-sm">
    EN KÖTÜ PERFORMANS
  </p>

  <h2 className="text-2xl font-bold text-orange-500 mt-2">
    {enKotuPerformansHat}
  </h2>

  <p className="text-lg font-semibold mt-2">
    %{enKotuPerformansOran}
  </p>
</div>
<div className="bg-white rounded-3xl shadow-xl p-6 border">
  <p className="text-gray-500 text-sm">
    EN FAZLA HURDA
  </p>

  <h2 className="text-2xl font-bold text-red-600 mt-2">
    {enFazlaHurdaHat}
  </h2>

  <p className="text-lg font-semibold mt-2">
    {enFazlaHurdaAdet.toLocaleString("tr-TR")} adet
  </p>
</div>
  </div>
  )}
{hurdaDagilimi.length > 0 && (
  <div className="mt-8 bg-white rounded-3xl shadow-xl p-6 border">

    <h2 className="text-2xl font-bold mb-6">
      Hurda Tipi Dağılımı
    </h2>

    <div style={{ width: "100%", height: 400 }}>

      <ResponsiveContainer>

        <PieChart>

          <Pie
            data={hurdaDagilimi}
            cx="50%"
            cy="50%"
            outerRadius={140}
            dataKey="value"
            nameKey="name"
            label
          >
            {hurdaDagilimi.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  COLORS[
                    index % COLORS.length
                  ]
                }
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />

        </PieChart>

      </ResponsiveContainer>

    </div>

  </div>

)}
{paretoVerisi.length > 0 && (

<div className="mt-8 bg-white rounded-3xl shadow-xl p-6 border">

  <h2 className="text-2xl font-bold mb-6">
    Hurda Pareto Analizi
  </h2>

  <div style={{ width: "100%", height: 450 }}>

    <ResponsiveContainer>

      <ComposedChart
        data={paretoVerisi}
      >

        <CartesianGrid
          strokeDasharray="3 3"
        />

        <XAxis dataKey="name" />

        <YAxis
          yAxisId="left"
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
        />

        <Tooltip />

        <Legend />

        <Bar
          yAxisId="left"
          dataKey="value"
          name="Hurda Adedi"
        />

        <Line
          yAxisId="right"
          dataKey="kumulatif"
          name="Kümülatif %"
        />

      </ComposedChart>

    </ResponsiveContainer>

  </div>

</div>

)}
{hatAnalizi.length > 0 && (

<div className="mt-8 bg-white rounded-3xl shadow-xl p-6 border">

  <h2 className="text-2xl font-bold mb-6">
    Hat Bazlı Hurda Analizi
  </h2>

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead>

        <tr className="border-b">

          <th className="text-left p-3">
            Hat
          </th>

          <th className="text-right p-3">
            Üretim
          </th>

          <th className="text-right p-3">
            Hurda
          </th>

          <th className="text-right p-3">
            Oran %
          </th>

        </tr>

      </thead>

      <tbody>

        {hatAnalizi.map((hat) => (

          <tr
            key={hat.hat}
            className="border-b hover:bg-gray-50"
          >

            <td className="p-3 font-semibold">
              {hat.hat}
            </td>

            <td className="p-3 text-right">
              {hat.uretim.toLocaleString("tr-TR")}
            </td>

            <td className="p-3 text-right">
              {hat.hurda.toLocaleString("tr-TR")}
            </td>

            <td
              className={`p-3 text-right font-bold ${
                hat.oran >= 5
                  ? "text-red-600"
                  : hat.oran >= 3
                  ? "text-orange-500"
                  : "text-green-600"
              }`}
            >
              %{hat.oran}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>

)}
{gunlukTrend.length > 0 && (

<div className="mt-8 bg-white rounded-3xl shadow-xl p-6 border">

  <h2 className="text-2xl font-bold mb-6">
    Günlük Hurda Oranı Trendi
  </h2>

  <div style={{ width: "100%", height: 400 }}>

    <ResponsiveContainer>

      <LineChart
        data={gunlukTrend}
      >

        <CartesianGrid
          strokeDasharray="3 3"
        />

        <XAxis
          dataKey="tarih"
        />

        <YAxis />

        <Tooltip />

        <Legend />

        <Line
          type="monotone"
          dataKey="oran"
          name="Hurda Oranı %"
        />

      </LineChart>

    </ResponsiveContainer>

  </div>

</div>

)}
{raporVerileri.length > 0 && (

<div className="mt-8 bg-white rounded-3xl shadow-xl p-6 border">

  <h2 className="text-2xl font-bold mb-6">
    Yönetici Özeti
  </h2>

  <div className="space-y-4 text-lg">

    <div>
      📊 Toplam üretim
      <strong>
        {" "}
        {toplamUretim.toLocaleString("tr-TR")}
        {" "}adet
      </strong>
      , toplam hurda
      <strong>
        {" "}
        {toplamHurda.toLocaleString("tr-TR")}
        {" "}adet
      </strong>
       ve hurda oranı
      <strong>
        {" "}
        %{hurdaOrani}
      </strong>
       olarak gerçekleşmiştir.
    </div>

    <div>
      🎯 En yüksek hurda oranı
      <strong>
        {" "}
        {enKotuPerformansHat}
      </strong>
      hattında görülmüştür
      (
      <strong>
        %{enKotuPerformansOran}
      </strong>
      ).
    </div>

    <div>
      🏭 En fazla hurda
      <strong>
        {" "}
        {enFazlaHurdaHat}
      </strong>
      hattında oluşmuş olup
      toplam
      <strong>
        {" "}
        {enFazlaHurdaAdet.toLocaleString("tr-TR")}
      </strong>
      adet hurda kaydedilmiştir.
    </div>

    <div>
      📦 Toplam hurdanın büyük bölümü
      <strong>
        {" "}
        {ilkUcHurda}
      </strong>
      kaynaklıdır.
    </div>

  </div>

</div>

)}
      </div>

    </div>
  );
}

export default Dashboard;