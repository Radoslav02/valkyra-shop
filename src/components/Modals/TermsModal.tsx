import { useEffect } from "react";
import "./TermsModal.css";

interface TermsModalProps {
  isOpen: boolean;
  close: () => void;
}

function TermsModal({ isOpen, close }: TermsModalProps) {
  if (!isOpen) return null;

  //Disables scrolling on the body when the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Uslovi Korišćenja</h2>
        <p>
          <strong>1. Uvod</strong>
        </p>
        <p>
          Dobrodošli na našu web stranicu. Ovi uslovi korišćenja ("Uslovi")
          regulišu vašu upotrebu naše web stranice ("Stranica") i naših usluga
          ("Usluge"). Pristupom i korišćenjem ove Stranice, slažete se da budete
          u obavezi da se pridržavate ovih Uslova. Ukoliko se ne slažete sa
          uslovima, molimo vas da ne koristite ovu Stranicu.
        </p>

        <p>
          <strong>2. Korišćenje Stranice</strong>
        </p>
        <p>
          Koristite Stranicu u skladu sa važećim zakonima. Korišćenje Stranice
          za nezakonite ili neovlašćene aktivnosti je zabranjeno.
        </p>

        <p>
          <strong>3. Registracija i Bezbednost Računa</strong>
        </p>
        <p>
          Da biste koristili određene funkcionalnosti na Stranici, kao što su
          kupovina proizvoda, moraćete da se registrujete. Tokom registracije,
          od vas ćemo tražiti određene lične podatke.
        </p>

        <p>
          <strong>4. Prikupljanje i Korišćenje Ličnih Podataka</strong>
        </p>
        <p>
          Prikupljamo lične podatke koje nam korisnici dobrovoljno pružaju
          prilikom registracije, kupovine ili komunikacije s nama. Ovi podaci se
          koriste u cilju obavljanja naših usluga, obrade narudžbina i slanja
          obaveštenja.
        </p>

        <p>
          <strong>5. Privatnost i Zaštita Podataka</strong>
        </p>
        <p>
          Naša stranica koristi zaštitu od zlonamernih napada i enkripciju kako
          bi osigurala bezbednost vaših podataka. Vaši podaci će biti čuvani u
          skladu sa važećim zakonima o zaštiti podataka.
        </p>

        <p>
          <strong>6. Plaćanje Pouzećem</strong>
        </p>
        <p>
          Naša Stranica omogućava plaćanje pouzećem prilikom dostave proizvoda.
          Plaćanje se vrši u gotovini ili putem drugih metoda koje su dostupne
          pri dostavi.
        </p>

        <p>
          <strong>7. Prava na Intelektualnu Svojinu</strong>
        </p>
        <p>
          Sav sadržaj na ovoj Stranici je zaštićen zakonima o intelektualnoj
          svojini. Zabranjeno je kopiranje, distribucija ili modifikacija bilo
          kog dela Stranice bez naše saglasnosti.
        </p>

        <p>
          <strong>8. Ograničenje Odgovornosti</strong>
        </p>
        <p>
          Ne snosimo odgovornost za greške ili nepreciznosti na Stranici,
          uključujući informacije o proizvodima i cene. Takođe, ne garantujemo
          da će Stranica biti uvek dostupna.
        </p>

        <p>
          <strong>9. Saglasnost sa Uslovima Korišćenja</strong>
        </p>
        <p>
          Korišćenjem ove Stranice, izričito potvrđujete da ste pročitali,
          razumeli i saglasni sa ovim Uslovima. Pre nego što finalizujete
          narudžbinu, moraćete da označite polje sa oznakom „Slažem se sa
          uslovima korišćenja“.
        </p>

        <p>
          <strong>10. Izmene Uslova Korišćenja</strong>
        </p>
        <p>
          Možemo u bilo kojem trenutku izmeniti ove Uslove. Ove izmene stupaju
          na snagu odmah nakon što budu objavljene na Stranici.
        </p>

        <p>
          <strong>11. Kontakt</strong>
        </p>
        <p>
          Ako imate bilo kakvih pitanja u vezi sa ovim Uslovima, možete nas
          kontaktirati putem naše kontakt stranice ili putem e-mail adrese
          valkyradesign@gmail.com
        </p>

        <button onClick={close}>Zatvori</button>
      </div>
    </div>
  );
}

export default TermsModal;
