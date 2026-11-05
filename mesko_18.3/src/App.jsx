import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
    const [osoba, setOsoba] = useState(null);
    const [nacitavaSa, setNacitavaSa] = useState(true);
    const [chyba, setChyba] = useState("");
    const [poradie, setPoradie] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function nacitajOsobu() {
            setNacitavaSa(true);
            setChyba("");

            try {
                const odpoved = await axios.get("https://randomuser.me/api/", {
                    signal: controller.signal,
                    params: { seed: crypto.randomUUID() }
                });

                const novaOsoba = odpoved.data.results?.[0];

                if (!novaOsoba) {
                    throw new Error("API nevrátilo žiadnu osobu.");
                }

                setOsoba(novaOsoba);
            } catch {
                if (!controller.signal.aborted) {
                    setChyba("Osobu sa nepodarilo načítať. Skús kliknúť na šípku znova.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setNacitavaSa(false);
                }
            }
        }

        nacitajOsobu();

        return () => controller.abort();
    }, [poradie]);

    const meno = osoba ? `${osoba.name.first} ${osoba.name.last}` : "";
    const telefon = osoba ? osoba.phone.replace(/[^\d+]/g, "") : "";

    return (
        <main className="stranka">
            <section className="profil" aria-labelledby="nadpis">
                <h1 id="nadpis">Náhodná osoba</h1>

                {osoba && (
                    <div className="udaje">
                        <img
                            className="fotka"
                            src={osoba.picture.large}
                            alt={`Portrét osoby ${meno}`}
                            width="120"
                            height="120"
                        />

                        <h2>{meno}</h2>

                        <p>
                            <a href={`mailto:${osoba.email}`}>{osoba.email}</a>
                        </p>

                        <p>
                            <a href={`tel:${telefon}`}>{osoba.phone}</a>
                        </p>
                    </div>
                )}

                <p className="hlasenie" role="status">
                    {nacitavaSa ? "Načítavam osobu…" : chyba}
                </p>

                <button
                    className="sipka"
                    type="button"
                    aria-label="Načítať ďalšiu osobu"
                    disabled={nacitavaSa}
                    onClick={() => setPoradie((predosle) => predosle + 1)}
                >
                    →
                </button>
            </section>
        </main>
    );
}