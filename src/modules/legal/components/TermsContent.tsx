import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes.constants';

export function TermsContent(): React.JSX.Element {
  return (
    <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex max-w-4xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Términos de uso de Vesper
          </h1>
          <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">
            Última actualización: 3 de noviembre de 2026 · Versión 1.0
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">1. Aceptación</h2>
          <p className="text-muted text-sm leading-7">
            Estos Términos de uso («Términos») regulan el acceso y uso de Vesper («la App»), una
            aplicación web de información meteorológica y astronómica. Al acceder o usar la App
            aceptas estos Términos. Si no estás de acuerdo, no uses la App.
          </p>
          <p className="text-muted text-sm leading-7">
            La App es un proyecto personal de John Alejandro Gómez González («el Titular»), con
            sitio web en{' '}
            <a
              href="https://johnish.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              johnish.dev
            </a>{' '}
            y contacto en{' '}
            <a
              href="mailto:hello.johnish@gmail.com"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              hello.johnish@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            2. Descripción del servicio
          </h2>
          <p className="text-muted text-sm leading-7">Vesper muestra:</p>
          <ul className="text-muted flex list-disc flex-col gap-1 pl-5 text-sm leading-7">
            <li>Condiciones meteorológicas actuales y pronóstico por horas.</li>
            <li>
              Información astronómica calculada localmente: Sol, Luna, planetas, fases, ventanas de
              observación y una puntuación orientativa.
            </li>
            <li>
              Selección de ubicación mediante lista curada, búsqueda por nombre, GPS o ubicación
              aproximada por IP.
            </li>
          </ul>
          <p className="text-muted text-sm leading-7">
            La App no requiere cuenta, no permite subir contenido y no ofrece asesoramiento
            profesional.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            3. Gratuidad y uso no comercial
          </h2>
          <p className="text-muted text-sm leading-7">
            Vesper se ofrece actualmente de forma gratuita, sin anuncios, suscripciones ni compras.
            No puedes revender, empaquetar ni explotar comercialmente la App o sus datos sin
            autorización previa del Titular, salvo que la licencia aplicable lo permita.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            4. Uso permitido y prohibido
          </h2>
          <p className="text-muted text-sm leading-7">
            Puedes usar la App para consulta personal e informativa. No debes:
          </p>
          <ul className="text-muted flex list-disc flex-col gap-1 pl-5 text-sm leading-7">
            <li>
              Interferir con el funcionamiento, la seguridad o la disponibilidad del servicio.
            </li>
            <li>Intentar acceder a sistemas, datos o áreas no públicas.</li>
            <li>Automatizar peticiones masivas, hacer scraping abusivo o eludir límites.</li>
            <li>Suplantar identidades o usar la App para fines ilícitos.</li>
            <li>Introducir malware o realizar ataques.</li>
            <li>Eliminar avisos de atribución o de propiedad intelectual.</li>
          </ul>
          <p className="text-muted text-sm leading-7">
            Podemos suspender o limitar el acceso si detectamos abuso, riesgo de seguridad o
            incumplimiento de estos Términos.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            5. Datos, fuentes y atribución
          </h2>
          <p className="text-muted text-sm leading-7">
            El clima proviene de{' '}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              Open-Meteo
            </a>
            , cuyos datos se ofrecen bajo licencia CC-BY 4.0. La atribución visible es obligatoria y
            se muestra en el pie de la App. Los cálculos astronómicos se realizan localmente con
            astronomy-engine; no se envían datos a un servicio astronómico externo.
          </p>
          <p className="text-muted text-sm leading-7">
            Las coordenadas se redondean a dos decimales (aproximadamente 1 km) antes de usarse en
            la URL, en las claves de caché y en las peticiones. Open-Meteo puede recibir las
            coordenadas desde tu navegador o, en ciudades curadas, desde el servidor.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            6. Descargo de responsabilidad
          </h2>
          <p className="text-muted text-sm leading-7">
            <strong className="text-foreground font-semibold">
              La información es orientativa y puede contener errores, retrasos o datos incompletos.
            </strong>{' '}
            No garantizamos que el clima, la visibilidad, la nubosidad, la posición de los astros,
            las ventanas de observación o la puntuación sean exactos o estén actualizados.
          </p>
          <p className="text-muted text-sm leading-7">
            <strong className="text-foreground font-semibold">
              No uses Vesper para aviación, navegación, actividades marítimas, emergencias, rescate,
              seguridad de personas o bienes, ni para decisiones críticas.
            </strong>{' '}
            Consulta fuentes oficiales y profesionales cuando la seguridad o intereses importantes
            estén en juego. La observación astronómica depende de condiciones locales que la App no
            puede verificar.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            7. Disponibilidad y cambios
          </h2>
          <p className="text-muted text-sm leading-7">
            La App se ofrece «tal cual» y «según disponibilidad». Podemos modificar, suspender o
            retirar funciones, o el servicio completo, sin previo aviso. No garantizamos
            disponibilidad ininterrumpida ni ausencia de errores. No existe compromiso de soporte.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            8. Propiedad intelectual
          </h2>
          <p className="text-muted text-sm leading-7">
            El nombre Vesper, el diseño, el código y los contenidos propios son del Titular o se
            usan con autorización. No se concede ninguna licencia sobre ellos salvo el uso normal de
            la App. Los datos de Open-Meteo se rigen por CC-BY 4.0. Las marcas de terceros
            pertenecen a sus titulares.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            9. Enlaces y servicios de terceros
          </h2>
          <p className="text-muted text-sm leading-7">
            La App enlaza a Open-Meteo y se apoya en{' '}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              Vercel
            </a>{' '}
            para el alojamiento. No controlamos esos servicios y no somos responsables de su
            disponibilidad, contenido o prácticas. Sus términos y políticas se aplican a ellos.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">10. Privacidad</h2>
          <p className="text-muted text-sm leading-7">
            El tratamiento de datos se describe en la{' '}
            <Link
              href={ROUTES.legal.privacy}
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              Política de Privacidad
            </Link>
            . Al usar la App aceptas ese tratamiento en la medida permitida por la ley.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">11. Menores</h2>
          <p className="text-muted text-sm leading-7">
            La App es de público general. Los menores deben usarla con autorización y supervisión de
            su representante legal. No creamos cuentas ni solicitamos datos personales de menores.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            12. Limitación de responsabilidad
          </h2>
          <p className="text-muted text-sm leading-7">
            En la medida máxima permitida por la ley aplicable, el Titular no responde por daños
            indirectos, incidentales, especiales, consecuenciales, pérdida de datos, lucro cesante o
            daño reputacional derivados del uso o de la imposibilidad de uso de la App. Nada en
            estos Términos excluye o limita responsabilidades que no puedan excluirse legalmente, ni
            derechos imperativos del consumidor.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            13. Modificaciones
          </h2>
          <p className="text-muted text-sm leading-7">
            Podemos actualizar estos Términos. Publicaremos la fecha de la última actualización y,
            si el cambio es sustancial, lo destacaremos. El uso continuado después de la publicación
            implica la aceptación de la versión vigente.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            14. Legislación aplicable y conflictos
          </h2>
          <p className="text-muted text-sm leading-7">
            Salvo normas imperativas de tu país de residencia, estos Términos se rigen por las leyes
            de Colombia, país de establecimiento del Titular. Cualquier controversia se someterá a
            los tribunales competentes de Colombia, sin perjuicio de los derechos que te
            correspondan como consumidor en tu lugar de residencia. Antes de litigar, te pedimos que
            nos contactes para intentar resolverlo de buena fe.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            15. Disposiciones generales
          </h2>
          <p className="text-muted text-sm leading-7">
            Si alguna cláusula resulta inválida, el resto seguirá vigente. La falta de ejercicio de
            un derecho no constituye renuncia. Estos Términos y la Política de Privacidad forman el
            acuerdo completo sobre la App.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">16. Contacto</h2>
          <p className="text-muted text-sm leading-7">
            John Alejandro Gómez González
            <br />
            <a
              href="https://johnish.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              johnish.dev
            </a>
            <br />
            <a
              href="mailto:hello.johnish@gmail.com"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              hello.johnish@gmail.com
            </a>
          </p>
        </section>
      </div>

      <aside className="border-border bg-surface flex h-fit flex-col gap-4 rounded-[4px] border p-4 lg:sticky lg:top-6">
        <div className="flex flex-col gap-1">
          <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">Documento</p>
          <p className="text-foreground text-sm">Términos de uso</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">Titular</p>
          <p className="text-foreground text-sm">John Alejandro Gómez González</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">Contacto</p>
          <a
            href="mailto:hello.johnish@gmail.com"
            className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary text-sm underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
          >
            hello.johnish@gmail.com
          </a>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">Versión</p>
          <p className="text-foreground text-sm">1.0 · 3 de noviembre de 2026</p>
        </div>
        <Link
          href={ROUTES.legal.privacy}
          className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background border-border hover:text-primary mt-1 border-t pt-3 text-sm underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          Ver Política de Privacidad →
        </Link>
      </aside>
    </article>
  );
}
