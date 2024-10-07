import React, { useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatComponent() {
  const [message, setMessage] = useState(''); // Estado para almacenar el valor del input
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // Para manejar el historial del chat

  const handleSendMessage = async () => {
    if (!message.trim()) return; // Prevenir mensajes vacíos

    try {
      setLoading(true);
      setChatHistory(prev => [...prev, `Tú: ${message}`]);
      setMessage(''); // Limpiamos el campo de texto

      const response = await fetch('https://chatbot-api-3xhr.onrender.com/api/message', { // Cambia a la URL de tu API en Render
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }), // Asegúrate de que el cuerpo sea como lo espera tu API
      });

      // Verificamos si la respuesta no es JSON
      if (!response.ok) {
        const text = await response.text();
        console.error('Respuesta no válida:', text);
        throw new Error('Error en la respuesta de la API');
      }

      const responseData = await response.json();

      // Asegúrate de que la estructura de responseData sea la que estás esperando
      if (responseData && responseData.data && responseData.data.length > 0) {
        const markdownData = responseData.data[0].content[0].text.value;
        setChatHistory(prev => [...prev, `Bot: ${markdownData}`]);
      } else {
        setChatHistory(prev => [...prev, 'Bot: No hay respuesta disponible']);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error en la petición:', error);
      setChatHistory(prev => [...prev, 'Bot: Error al procesar la petición']);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[750px] sm:h-[800px] md:h-[700] xl:h-[900px] items-center justify-center p-5 overflow-y-clip">
      {/* Chat Container */}
      <div className="flex-1 p-4 w-full max-w-4xl mx-auto bg-gray-100 shadow-md rounded-lg overflow-auto">
        <div className="max-w-2xl mx-auto">
          {chatHistory.map((message, index) => (
            <div key={index} className={`p-3 my-2 ${message.startsWith('Tú:') ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block px-4 py-2 rounded-lg ${message.startsWith('Tú:') ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} className="overflow-y-visible">
                  {message.replace('Tú:', '').replace('Bot:', '')}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Container */}
      <div className="w-full max-w-4xl mx-auto bg-white p-4 border-t border-gray-200 mt-4">
        <form className="flex items-center space-x-4" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
          <Input
            className="flex-1 text-black"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
          <Button color='primary' variant='shadow' onClick={handleSendMessage} isLoading={loading} isDisabled={loading}>
            {loading ? '' : "Enviar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
