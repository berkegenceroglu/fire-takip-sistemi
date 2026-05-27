import { useState, useEffect } from "react";
import { db } from "./firebase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

function App() {
  const hatlar = [
    "Hat 1",
    "Hat 2",
    "Hat 3",
    "Hat 4",
    "Hat 1-1",
    "Hat 2-1",
    "Hat 3-1",
    "Hat 4-1",
    "Niche 5",
    "Niche 6",
    "Niche 7",
    "Niche 8",
    "Sıvı Dolum 1",
    "Sıvı Dolum 2",
    "Sıvı Dolum 3",
    "Kolonya",
    "Tester",
  ];

  const [formData, setFormData] = useState({
    hat: "",
    urun: "",
    planlanan: "",
    gerceklesen: "",
    sise: "",
    valf: "",
    kapak: "",
    separator: "",
    kutu: "",
    yuzuk: "",
    etiket: "",
  });

  const [kayitlar, setKayitlar] = useState([]);
const [adminSifre, setAdminSifre] = useState("");
const [popupAcik, setPopupAcik] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const verileriGetir = async () => {
    const querySnapshot = await getDocs(
      collection(db, "fireKayitlari")
    );

    const liste = [];

    querySnapshot.forEach((doc) => {
      liste.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    setKayitlar(liste.reverse());
  };

  useEffect(() => {
    verileriGetir();
  }, []);

  const toplamFire =
    Number(formData.sise || 0) +
    Number(formData.valf || 0) +
    Number(formData.kapak || 0) +
    Number(formData.separator || 0) +
    Number(formData.kutu || 0) +
    Number(formData.yuzuk || 0) +
    Number(formData.etiket || 0);

  const toplamSise = kayitlar.reduce(
    (toplam, item) => toplam + Number(item.sise || 0),
    0
  );

  const toplamValf = kayitlar.reduce(
    (toplam, item) => toplam + Number(item.valf || 0),
    0
  );

  const toplamKapak = kayitlar.reduce(
    (toplam, item) => toplam + Number(item.kapak || 0),
    0
  );

  const toplamSeparator = kayitlar.reduce(
    (toplam, item) =>
      toplam + Number(item.separator || 0),
    0
  );

  const toplamKutu = kayitlar.reduce(
    (toplam, item) =>
      toplam + Number(item.kutu || 0),
    0
  );

  const toplamYuzuk = kayitlar.reduce(
    (toplam, item) =>
      toplam + Number(item.yuzuk || 0),
    0
  );

  const toplamEtiket = kayitlar.reduce(
    (toplam, item) =>
      toplam + Number(item.etiket || 0),
    0
  );

  const genelToplamFire = kayitlar.reduce(
    (toplam, item) =>
      toplam + Number(item.toplamFire || 0),
    0
  );

  const excelIndir = () => {
    const excelVerisi = kayitlar.map((item) => ({
      Tarih: item.tarih,
      Saat: item.saat,
      Hat: item.hat,
      Ürün: item.urun,
      Planlanan: item.planlanan,
      Gerçekleşen: item.gerceklesen,
      Şişe: item.sise,
      Valf: item.valf,
      Kapak: item.kapak,
      Seperatör: item.separator,
      Kutu: item.kutu,
      Yüzük: item.yuzuk,
      Etiket: item.etiket,
      ToplamFire: item.toplamFire,
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(excelVerisi);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Fire Raporu"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(data, "fire-raporu.xlsx");
  };

  const handleSubmit = async () => {
    const bosAlanVar = Object.values(formData).some(
  (deger) => deger === ""
);

if (bosAlanVar) {
  const gerceklesenAdet = Number(
  formData.gerceklesen
);


}
  toast.error("Boş alan bırakılamaz!");
  return;
}
const gerceklesenAdet = Number(
  formData.gerceklesen
);

const fireAlanlari = [
  Number(formData.sise),
  Number(formData.valf),
  Number(formData.kapak),
  Number(formData.separator),
  Number(formData.kutu),
  Number(formData.yuzuk),
  Number(formData.etiket),
];

const hataliFireVar = fireAlanlari.some(
  (fire) => fire > gerceklesenAdet
);

if (hataliFireVar) {
  toast.error(
    "Gerçekleşen adetten fazla fire girilemez!"
  );
  return;
}
    try {
      await addDoc(collection(db, "fireKayitlari"), {
        ...formData,
        toplamFire,
        tarih: new Date().toLocaleDateString("tr-TR"),
        saat: new Date().toLocaleTimeString("tr-TR"),
      });

      toast.success("Kayıt başarıyla eklendi!");

      verileriGetir();

      setFormData({
        hat: "",
        urun: "",
        planlanan: "",
        gerceklesen: "",
        sise: "",
        valf: "",
        kapak: "",
        separator: "",
        kutu: "",
        yuzuk: "",
        etiket: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Hata oluştu!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-6">

        <h1 className="text-4xl font-bold text-center mb-8">
          FIRE TAKİP SİSTEMİ
        </h1>

        <div className="space-y-4 mb-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-black text-white rounded-2xl p-6 shadow-lg">
              <p className="text-lg opacity-80">
                Genel Toplam Fire
              </p>

              <h2 className="text-5xl font-bold mt-2">
                {genelToplamFire}
              </h2>
              {popupAcik && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl p-6 w-[90%] max-w-md shadow-2xl animate-fadeIn">

      <h2 className="text-3xl font-bold text-center text-black mb-2">
        Admin Girişi
      </h2>

      <p className="text-center text-gray-500 mb-6">
        Excel indirmek için şifre girin
      </p>

      <input
        type="password"
        placeholder="Şifre"
        value={adminSifre}
        onChange={(e) =>
          setAdminSifre(e.target.value)
        }
        className="w-full border-2 border-gray-300 rounded-2xl p-4 text-black text-lg outline-none focus:border-green-500 transition"
      />

      <div className="flex gap-3 mt-6">

        <button
          onClick={() => {
            if (adminSifre === "berke987") {
              excelIndir();
              setPopupAcik(false);
              setAdminSifre("");
            } else {
              toast.error("Şifre yanlış!");
            }
          }}
          className="flex-1 bg-black hover:bg-gray-800 text-white p-4 rounded-2xl font-semibold transition"
        >
          Giriş Yap
        </button>

        <button
          onClick={() => {
            setPopupAcik(false);
            setAdminSifre("");
          }}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-black p-4 rounded-2xl font-semibold transition"
        >
          İptal
        </button>

      </div>

    </div>

  </div>
)}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border">
              <p className="text-lg text-gray-500">
                Toplam Kayıt
              </p>

              <h2 className="text-5xl font-bold mt-2">
                {kayitlar.length}
              </h2>
            </div>
<ToastContainer
  position="top-center"
  autoClose={2500}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  theme="dark"
/>
          </div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

  <div className="bg-white rounded-xl p-4 shadow border text-center w-full">
    <p className="text-gray-500">
      Şişe
    </p>

    <h3 className="text-3xl font-bold text-red-600">
      {toplamSise}
    </h3>
  </div>

  <div className="bg-white rounded-xl p-4 shadow border text-center w-full">
    <p className="text-gray-500">
      Valf
    </p>

    <h3 className="text-3xl font-bold text-blue-600">
      {toplamValf}
    </h3>
  </div>

  <div className="bg-white rounded-xl p-4 shadow border text-center w-full">
    <p className="text-gray-500">
      Kapak
    </p>

    <h3 className="text-3xl font-bold text-yellow-600">
      {toplamKapak}
    </h3>
  </div>

  <div className="bg-white rounded-xl p-4 shadow border text-center w-full">
    <p className="text-gray-500">
      Seperatör
    </p>

    <h3 className="text-3xl font-bold text-purple-600">
      {toplamSeparator}
    </h3>
  </div>

</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 max-w-3xl mx-auto">

  <div className="bg-white rounded-xl p-4 shadow border text-center w-full">
    <p className="text-gray-500">
      Kutu
    </p>

    <h3 className="text-3xl font-bold text-orange-600">
      {toplamKutu}
    </h3>
  </div>

  <div className="bg-white rounded-xl p-4 shadow border text-center w-full">
    <p className="text-gray-500">
      Yüzük
    </p>

    <h3 className="text-3xl font-bold text-pink-600">
      {toplamYuzuk}
    </h3>
  </div>

  <div className="bg-white rounded-xl p-4 shadow border text-center w-full">
    <p className="text-gray-500">
      Etiket
    </p>

    <h3 className="text-3xl font-bold text-green-600">
      {toplamEtiket}
    </h3>
  </div>

</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="font-semibold">Hat</label>

            <select
              name="hat"
              value={formData.hat}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-1"
            >
              <option value="">Hat Seçin</option>

              {hatlar.map((hat) => (
                <option key={hat} value={hat}>
                  {hat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold">Ürün Adı</label>

            <input
              type="text"
              name="urun"
              value={formData.urun}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-1"
              placeholder="Ürün adı girin"
            />
          </div>

          <div>
            <label className="font-semibold">
              Planlanan Adet
            </label>

            <input
              type="number"
              name="planlanan"
              value={formData.planlanan}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-1"
            />
          </div>

          <div>
            <label className="font-semibold">
              Gerçekleşen Adet
            </label>

            <input
              type="number"
              name="gerceklesen"
              value={formData.gerceklesen}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-1"
            />
          </div>

          {[
            ["sise", "Şişe Firesi"],
            ["valf", "Valf Firesi"],
            ["kapak", "Kapak Firesi"],
            ["separator", "Seperatör Firesi"],
            ["kutu", "Kutu Firesi"],
            ["yuzuk", "Yüzük Firesi"],
            ["etiket", "Etiket Firesi"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="font-semibold">
                {label}
              </label>

              <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 mt-1"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 bg-red-100 text-red-700 rounded-2xl p-5 text-center">
          <p className="text-lg font-semibold">
            Toplam Fire
          </p>

          <p className="text-4xl font-bold">
            {toplamFire}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full mt-4 bg-black text-white p-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition"
        >
          Kaydet
        </button>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setPopupAcik(true)}
            className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            Excel İndir
          </button>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-5">
            Günlük Kayıtlar
          </h2>

          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full border-collapse">

              <thead>
                <tr className="bg-black text-white">
                  <th className="p-4 border">
                    Saat
                  </th>

                  <th className="p-4 border">
                    Hat
                  </th>

                  <th className="p-4 border">
                    Ürün
                  </th>

                  <th className="p-4 border">
                    Toplam Fire
                  </th>
                </tr>
              </thead>

              <tbody>
                {kayitlar.map((kayit) => (
                  <tr
                    key={kayit.id}
                    className="text-center hover:bg-gray-50"
                  >
                    <td className="border p-3">
                      {kayit.saat}
                    </td>

                    <td className="border p-3">
                      {kayit.hat}
                    </td>

                    <td className="border p-3">
                      {kayit.urun}
                    </td>

                    <td className="border p-3 font-bold text-red-600">
                      {kayit.toplamFire}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;