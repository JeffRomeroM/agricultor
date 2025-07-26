<template>
  <div class="chat-container">
    <h1>Chatbot de Productos</h1>

    <div class="chat-box" ref="chatBox">
      <div v-for="(msg, index) in mensajes" :key="index" :class="['mensaje', msg.tipo]">
        <p v-html="msg.texto"></p>
      </div>
    </div>

    <input
      v-model="pregunta"
      @keyup.enter="enviarPregunta"
      :disabled="procesando"
      placeholder="Pregúntame sobre un producto..."
      autocomplete="off"
      spellcheck="false"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      productos: [],
      pregunta: '',
      mensajes: [],
      procesando: false,
    };
  },
  mounted() {
    fetch("https://script.google.com/macros/s/AKfycbx0RNhJkdCr4lmFfQR3zSTOPKCyOJ8FwERz5jq5zP0EoVQJH9G46odjysXKcbvWPOoL/exec")
      .then(res => res.json())
      .then(result => {
        this.productos = result.data || result;
      })
      .catch(err => {
        console.error("Error al cargar productos", err);
      });
  },
  methods: {
    async enviarPregunta() {
      const texto = this.pregunta.trim();
      if (!texto) return;

      this.mensajes.push({ texto: this.escapeHtml(texto), tipo: 'usuario' });
      this.pregunta = '';
      this.procesando = true;
      this.$nextTick(() => this.scrollAlFinal());

      // Simular tiempo de respuesta
      await new Promise(r => setTimeout(r, 500));

      const respuesta = this.generarRespuesta(texto);
      this.mensajes.push({ texto: respuesta, tipo: 'bot' });
      this.procesando = false;
      this.$nextTick(() => this.scrollAlFinal());
    },
    generarRespuesta(pregunta) {
      const texto = pregunta.toLowerCase().trim();

        const producto = this.productos.find(p =>
        p.Nombre && texto.includes(p.Nombre.toLowerCase())
        );


        if (!producto || !producto.Nombre) {
            return '❌ No encontré ese producto. Intenta con otro nombre.';
        }


      // Formatear respuesta con chequeo de campos vacíos
      const activo = producto.IngredienteActivo || 'No disponible';
      const precioRec = producto.PrecioRecurente || 'No disponible';
      const precioCas = producto.PrecioCasual || 'No disponible';
      const existencias = producto.Existencias || 'No disponible';

      return `
        📦 <strong>${this.escapeHtml(producto.Nombre)}</strong><br/>
        🧪 Ingrediente activo: ${this.escapeHtml(activo)}<br/>
        💵 Precio recurrente: ${this.escapeHtml(precioRec)}<br/>
        💲 Precio casual: ${this.escapeHtml(precioCas)}<br/>
        📦 Existencias: ${this.escapeHtml(existencias)}
      `;
    },
    scrollAlFinal() {
      const box = this.$refs.chatBox;
      if (box) {
        box.scrollTop = box.scrollHeight;
      }
    },
    escapeHtml(text) {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(text));
      return div.innerHTML;
    }
  }
};
</script>

<style scoped>
.chat-container {
  max-width: 500px;
  margin: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 12px rgb(0 0 0 / 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 15px;
  color: #333;
  user-select: none;
}

.chat-box {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  height: 320px;
  overflow-y: auto;
  background: #fefefe;
  margin-bottom: 15px;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #bbb transparent;
}

.chat-box::-webkit-scrollbar {
  width: 6px;
}

.chat-box::-webkit-scrollbar-thumb {
  background-color: #bbb;
  border-radius: 3px;
}

.mensaje {
  max-width: 75%;
  padding: 10px 15px;
  margin: 6px 0;
  border-radius: 20px;
  word-wrap: break-word;
  white-space: pre-line;
  box-sizing: border-box;
}

.usuario {
  background-color: #d0e7ff;
  color: #064273;
  margin-left: auto;
  text-align: right;
  border-bottom-right-radius: 0;
}

.bot {
  background-color: #e2f0d9;
  color: #2f4f1f;
  margin-right: auto;
  text-align: left;
  border-bottom-left-radius: 0;
}

input {
  width: 100%;
  padding: 12px 15px;
  border-radius: 25px;
  border: 1px solid #ccc;
  font-size: 16px;
  outline-offset: 2px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  border-color: #3b82f6;
}

input[disabled] {
  background: #eee;
  cursor: not-allowed;
}
</style>
