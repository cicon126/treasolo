import sys
import tkinter as tk

import db
from gui import ZhangBenApp


def main():
    db.init_db()

    root = tk.Tk()
    app = ZhangBenApp(root)

    try:
        root.iconbitmap(default="")
    except tk.TclError:
        pass

    root.mainloop()


if __name__ == "__main__":
    main()
