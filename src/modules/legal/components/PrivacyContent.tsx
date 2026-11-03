import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes.constants';

export function PrivacyContent(): React.JSX.Element {
  return (
    <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex max-w-4xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Política de Privacidad de Vesper
          </h1>
          <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">
            Última actualización: 3 de noviembre de 2026 · Versión 1.0
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            1. Responsable del tratamiento
          </h2>
          <p className="text-muted text-sm leading-7">
            John Alejandro Gómez González
            <br />
            País: Colombia
            <br />
            Sitio web:{' '}
            <a
              href="https://johnish.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              johnish.dev
            </a>
            <br />
            Contacto:{' '}
            <a
              href="mailto:hello.johnish@gmail.com"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              hello.johnish@gmail.com
            </a>
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">2. Alcance</h2>
          <p className="text-muted text-sm leading-7">
            Esta política explica qué datos trata Vesper, para qué, con quién se comparten y qué
            derechos tienes. Se aplica a la app web y a sus páginas legales.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">3. Principios</h2>
          <ul className="text-muted flex list-disc flex-col gap-1 pl-5 text-sm leading-7">
            <li>
              <strong className="text-foreground font-semibold">Minimización:</strong> no pedimos
              cuenta ni datos identificativos.
            </li>
            <li>
              <strong className="text-foreground font-semibold">Transparencia:</strong> solo usamos
              la ubicación para mostrar el clima.
            </li>
            <li>
              <strong className="text-foreground font-semibold">No persistencia propia:</strong> no
              mantenemos una base de datos de usuarios ni de ubicaciones.
            </li>
            <li>
              <strong className="text-foreground font-semibold">Seguridad:</strong> usamos HTTPS y
              acceso limitado a la infraestructura.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            4. Qué datos tratamos
          </h2>
          <p className="text-muted text-sm leading-7">
            <strong className="text-foreground font-semibold">
              a) Ubicación aproximada por IP.
            </strong>{' '}
            Al abrir <code className="text-foreground font-mono text-xs">/</code>, el servidor lee
            cabeceras de Vercel (latitud, longitud, ciudad, país y zona horaria) para redirigirte a
            un slug de coordenadas redondeadas. No almacenamos esa ubicación en servidores propios.
          </p>
          <p className="text-muted text-sm leading-7">
            <strong className="text-foreground font-semibold">b) Coordenadas del slug.</strong> La
            URL puede contener latitud y longitud redondeadas a dos decimales (aproximadamente 1
            km). Se usan para consultar Open-Meteo y calcular la astronomía. Si compartes un enlace
            con coordenadas, la otra persona verá la zona aproximada.
          </p>
          <p className="text-muted text-sm leading-7">
            <strong className="text-foreground font-semibold">c) GPS.</strong> Solo se usa si pulsas
            el botón de ubicación; el navegador te pide permiso. Si rechazas, no se obtiene. No
            almacenamos el resultado.
          </p>
          <p className="text-muted text-sm leading-7">
            <strong className="text-foreground font-semibold">d) Búsqueda por nombre.</strong> El
            texto se envía a Open-Meteo Geocoding para obtener resultados. No creamos cuentas ni
            historial de búsquedas.
          </p>
          <p className="text-muted text-sm leading-7">
            <strong className="text-foreground font-semibold">e) Datos técnicos.</strong> Vercel
            puede procesar IP, fecha y hora, URL solicitada, agente de usuario y registros de
            errores para operar, proteger y diagnosticar el servicio.
          </p>
          <p className="text-muted text-sm leading-7">
            <strong className="text-foreground font-semibold">f) Preferencias de sesión.</strong> El
            umbral de altitud y la caché del pronóstico viven en memoria de la pestaña y se pierden
            al cerrarla. No usamos almacenamiento persistente para ubicaciones ni preferencias.
          </p>
          <p className="text-muted text-sm leading-7">
            <strong className="text-foreground font-semibold">g) Datos no tratados.</strong> No
            tratamos datos de pago, cuentas, contactos, salud, biometría ni categorías especiales.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            5. Para qué usamos los datos
          </h2>
          <ul className="text-muted flex list-disc flex-col gap-1 pl-5 text-sm leading-7">
            <li>Elegir y mostrar el lugar solicitado.</li>
            <li>Obtener el pronóstico y calcular la noche.</li>
            <li>Mostrar la ubicación aproximada.</li>
            <li>Mantener la App segura y diagnosticar fallos.</li>
            <li>Cumplir obligaciones legales cuando corresponda.</li>
          </ul>
          <p className="text-muted text-sm leading-7">
            No usamos datos para publicidad, perfilado comercial ni venta a terceros.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            6. Coordenadas y Open-Meteo
          </h2>
          <p className="text-muted text-sm leading-7">
            Las coordenadas se envían a Open-Meteo para obtener el pronóstico. En ciudades curadas
            la petición la realiza el servidor; en el resto, tu navegador. Open-Meteo recibe también
            la IP de quien realiza la petición.
          </p>
          <p className="text-muted text-sm leading-7">
            Según sus términos, Open-Meteo conserva registros de servidor, que pueden incluir
            coordenadas, durante 90 días. Puedes consultar sus términos y su política de privacidad
            en{' '}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              open-meteo.com
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            7. Hosting y Vercel
          </h2>
          <p className="text-muted text-sm leading-7">
            Vercel aloja la App. Puede procesar direcciones IP, URLs, cabeceras y registros técnicos
            para entregar el servicio, prevenir abusos y diagnosticar errores, conforme a su propia
            política de privacidad. No le enviamos datos de cuenta porque no existen.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            8. Cookies y tecnologías similares
          </h2>
          <p className="text-muted text-sm leading-7">
            Actualmente Vesper no utiliza cookies, analítica, publicidad ni rastreadores. No hay
            píxeles ni scripts de terceros con fines publicitarios. La caché del pronóstico y el
            umbral de altitud se guardan en memoria de la pestaña.
          </p>
          <p className="text-muted text-sm leading-7">
            Si en el futuro incorporamos cookies o analítica, actualizaremos esta política y, cuando
            la ley lo exija, solicitaremos consentimiento antes de activarlas. Podrás rechazarlas
            sin perder el acceso básico.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">9. Conservación</h2>
          <p className="text-muted text-sm leading-7">
            No mantenemos una base de datos propia de usuarios, ubicaciones o búsquedas. Los datos
            en memoria se pierden al cerrar la pestaña. No hay modo sin conexión ni caché
            persistente.
          </p>
          <p className="text-muted text-sm leading-7">
            Open-Meteo conserva sus registros hasta 90 días según sus términos. Vercel conserva los
            registros técnicos según su política y configuración. Podemos conservar comunicaciones
            de soporte o solicitudes de derechos mientras sean necesarias para atenderlas y cumplir
            obligaciones legales.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            10. Base jurídica
          </h2>
          <p className="text-muted text-sm leading-7">
            Cuando la ley aplicable exija una base jurídica, tratamos la ubicación por IP sobre la
            base del interés legítimo en mostrar el lugar solicitado y mantener la seguridad del
            servicio; el GPS, sobre tu consentimiento mediante una acción explícita; y los registros
            técnicos, sobre el interés legítimo en operar y proteger la App. Puedes oponerte o
            retirar el consentimiento sin afectar al uso básico.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            11. Transferencias internacionales
          </h2>
          <p className="text-muted text-sm leading-7">
            Open-Meteo y Vercel pueden procesar datos fuera de tu país. Aplican sus propias medidas
            y políticas. Al usar la App, la información puede transferirse a esas jurisdicciones. Si
            la ley aplicable exige garantías adicionales, se aplicarán las de los proveedores.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">12. Tus derechos</h2>
          <p className="text-muted text-sm leading-7">
            Según la ley aplicable, puedes solicitar acceso, corrección, actualización, eliminación,
            revocación del consentimiento, oposición o limitación del tratamiento, y presentar una
            reclamación ante la autoridad de protección de datos de tu país.
          </p>
          <p className="text-muted text-sm leading-7">
            Escríbenos a{' '}
            <a
              href="mailto:hello.johnish@gmail.com"
              className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background hover:text-primary underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              hello.johnish@gmail.com
            </a>
            . Responderemos en un plazo razonable y, cuando la ley lo exija, dentro del plazo legal.
            Podemos pedirte información mínima para verificar la solicitud, sin crear un registro
            innecesario.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">13. Seguridad</h2>
          <p className="text-muted text-sm leading-7">
            Usamos HTTPS, minimización de datos, controles de acceso a la infraestructura y
            actualizaciones razonables. Ningún sistema es completamente seguro; no podemos
            garantizar seguridad absoluta. No hay cuentas ni contraseñas que proteger.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">14. Menores</h2>
          <p className="text-muted text-sm leading-7">
            La App es de público general y no está dirigida a menores sin supervisión. No creamos
            cuentas ni solicitamos datos personales. Si un menor usa la App, debe hacerlo con
            autorización y supervisión de su representante legal. Si crees que un menor nos ha
            enviado datos, escríbenos y los eliminaremos si procede.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            15. Enlaces a terceros
          </h2>
          <p className="text-muted text-sm leading-7">
            La App enlaza a Open-Meteo y puede enlazar a otros sitios. No controlamos sus prácticas;
            revisa sus políticas.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">16. Cambios</h2>
          <p className="text-muted text-sm leading-7">
            Podemos actualizar esta política. Publicaremos la fecha y la versión. Si el cambio es
            sustancial, lo destacaremos. El uso continuado después de la publicación implica
            aceptación en la medida permitida por la ley.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">17. Contacto</h2>
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
          <p className="text-foreground text-sm">Política de Privacidad</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-muted font-mono text-[10px] tracking-[0.08em] uppercase">
            Responsable
          </p>
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
          href={ROUTES.legal.terms}
          className="text-foreground focus-visible:ring-primary focus-visible:ring-offset-background border-border hover:text-primary mt-1 border-t pt-3 text-sm underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          Ver Términos de uso →
        </Link>
      </aside>
    </article>
  );
}
