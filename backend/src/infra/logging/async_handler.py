import contextvars
import logging
import queue
import threading


class AsyncLogHandler(logging.Handler):
    """Handler que encola los registros y los escribe en un thread dedicado.

    El hilo del request solo encola (operacion sincrona y rapida); el
    thread en background se ocupa de escribir en el destino. El context se
    captura al encolar para que el formatter vea el context de la request.
    """

    def __init__(self, target_handler: logging.Handler) -> None:
        super().__init__()
        self._queue: queue.Queue = queue.Queue()
        self._target_handler = target_handler
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def emit(self, record: logging.LogRecord) -> None:
        try:
            context = contextvars.copy_context()
            self._queue.put((context, record))
        except Exception:
            # El logging nunca debe romper el request que origina el log.
            pass

    def _run(self) -> None:
        while True:
            item = self._queue.get()
            if item is None:
                break
            context, record = item
            context.run(self._target_handler.handle, record)
            self._queue.task_done()

    def close(self) -> None:
        self._queue.put(None)
        self._thread.join()
        super().close()
