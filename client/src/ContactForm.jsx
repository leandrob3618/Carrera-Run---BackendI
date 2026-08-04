
export default function ContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const nombre = form.name.value.trim();
    const email = form.email.value.trim();
    const mensaje = form.mensaje.value.trim();

    if (!nombre ||!email ||!mensaje) {
      Swal.fire("Error", "⚠️ Completá todos los campos", "error");
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Mensaje enviado",
      text: "Gracias por contactarte",
      confirmButtonText: "OK"
    });
    form.reset();
  };

  return (
    <footer>
      <section className="contacto">
        <div className="general">
          <div className="contenido">
            <form id="form" className="form" onSubmit={handleSubmit}>
              <h3 className="tag"><span>SUMATE A NUESTRA TIENDA ONLINE</span></h3>
              <label htmlFor="name">Nombre Completo</label>
              <input name="name" required type="text" id="name" />
              <label htmlFor="email">Correo Electrónico</label>
              <input name="email" required type="email" id="email" />
              <label htmlFor="mensaje">Mensaje</label>
              <textarea id="mensaje" name="mensaje" cols="30" rows="10"></textarea>
              <button type="submit" className="boton primario">Enviar Mensaje</button>
            </form>
          </div>
        </div>
      </section>
    </footer>
  );
}