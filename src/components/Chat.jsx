import React, { useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatComponent() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setChatHistory(prev => [...prev, { sender: 'user', content: message }]); // Guardamos como objeto
      setMessage('');

      const response = await fetch('https://chatbot-api-3xhr.onrender.com/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Respuesta no válida:', text);
        throw new Error('Error en la respuesta de la API');
      }

      const responseData = await response.json();

      if (responseData && responseData.data && responseData.data.length > 0) {
        responseData.data.forEach((msg) => {
          msg.content.forEach(async (contentItem) => {
            if (contentItem.type === 'image_file' && contentItem.image_file) {
              // Si es una imagen, cargamos el gráfico
              await handleLoadGraph(contentItem.image_file.file_id);
            } else if (contentItem.type === 'text' && contentItem.text.value) {
              // Si es texto, lo agregamos como un mensaje del bot
              const markdownData = contentItem.text.value;
              setChatHistory(prev => [...prev, { sender: 'bot', content: markdownData }]);
            }
          });
        });
      } else {
        setChatHistory(prev => [...prev, { sender: 'bot', content: 'No hay respuesta disponible' }]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error en la petición:', error);
      setChatHistory(prev => [...prev, { sender: 'bot', content: 'Error al procesar la petición' }]);
      setLoading(false);
    }
  };

  const handleLoadGraph = async (id) => {
    try {
      const response = await fetch(`https://chatbot-api-3xhr.onrender.com/api/graph/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta al cargar el gráfico');
      }

      const graphData = await response.json();
      setChatHistory(prev => [
        ...prev, 
        { sender: 'bot', type: 'graph', content: graphData.content }
      ]);

    } catch (error) {
      console.error('Error en la petición:', error);
      setChatHistory(prev => [...prev, { sender: 'bot', content: 'Error al cargar el gráfico' }]);
    }
  }

  return (
    <div className="flex flex-col h-[750px] sm:h-[800px] md:h-[700px] xl:h-[900px] items-center justify-center p-5 overflow-y-clip">
      {/* Chat Container */}
      <div className="flex-1 p-4 w-full max-w-4xl mx-auto bg-gray-100 shadow-md rounded-lg overflow-auto">
        <div className="max-w-2xl mx-auto">
          {chatHistory.map((message, index) => (
            <div key={index} className={`p-3 my-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
              >
                {message.type === 'graph' ? (
                  <img src={`data:image/jpeg;base64,${message.content}`} alt="Grafico" />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="overflow-y-visible">
                    {message.content}
                  </ReactMarkdown>
                )}
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
            placeholder="¿Qué deseas saber?"
          />
          <Button color='primary' variant='shadow' onClick={handleSendMessage} isLoading={loading} isDisabled={loading}>
            {loading ? '' : "Enviar"}
          </Button>
        </form>
      </div>
    </div>
  );
}