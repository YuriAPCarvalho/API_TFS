"use client";
import { FaRocket } from "react-icons/fa";
import { LogoSistema } from "./components/LogoSistema/LogoSistema";
import Styles from "./styles.module.scss";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <div className={Styles.body}>
        <div className={Styles.container}>
          <div className={Styles.text_section}>
            <h1 className={Styles.title}>
              Lançamentos de <span className={Styles.highlight}>UST</span>
            </h1>
            <p className={Styles.texto}>
              Desenvolvido para apoiar e conduzir equipes a lugares que ainda
              não alcançados!
            </p>
            <button
              className={Styles.launch_button}
              onClick={() => router.push("/formulario")}
            >
              <FaRocket />
              Iniciar Lançamento
            </button>
          </div>
          <div className={Styles.image_section}>
            <LogoSistema className={Styles.logoSistema} />
          </div>
        </div>
      </div>
    </>
  );
}
