import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import subprocess
import threading
import os
import sys

class PortfolioApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Portfolio Generator")
        self.root.geometry("700x650")
        self.root.configure(padx=20, pady=20)
        
        style = ttk.Style()
        style.theme_use('clam')
        
        ttk.Label(root, text="AI-Tailored GitHub Portfolio", font=("Helvetica", 16, "bold")).pack(pady=(0, 20))
        
        form_frame = ttk.Frame(root)
        form_frame.pack(fill=tk.X, expand=False)
        
        ttk.Label(form_frame, text="GitHub Username:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.username_var = tk.StringVar(value="Jabtwin")
        ttk.Entry(form_frame, textvariable=self.username_var, width=50).grid(row=0, column=1, sticky=tk.W, pady=5, padx=10)
        
        ttk.Label(form_frame, text="GitHub Token:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.github_token_var = tk.StringVar()
        ttk.Entry(form_frame, textvariable=self.github_token_var, show="*", width=50).grid(row=1, column=1, sticky=tk.W, pady=5, padx=10)
        
        ttk.Label(form_frame, text="Gemini API Key:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.gemini_key_var = tk.StringVar()
        ttk.Entry(form_frame, textvariable=self.gemini_key_var, show="*", width=50).grid(row=2, column=1, sticky=tk.W, pady=5, padx=10)
        
        ttk.Label(root, text="Job Description:").pack(anchor=tk.W, pady=(15, 5))
        
        self.jd_text = scrolledtext.ScrolledText(root, width=80, height=15, font=("Helvetica", 10))
        self.jd_text.pack(fill=tk.BOTH, expand=True)
        
        try:
            with open("sample-jd.txt", "r", encoding="utf-8") as f:
                self.jd_text.insert(tk.END, f.read())
        except Exception:
            pass
            
        self.status_var = tk.StringVar(value="Ready.")
        self.status_label = ttk.Label(root, textvariable=self.status_var, font=("Helvetica", 10, "italic"), foreground="gray")
        self.status_label.pack(anchor=tk.W, pady=(15, 5))
        
        self.generate_btn = ttk.Button(root, text="Generate PDF", command=self.start_generation)
        self.generate_btn.pack(pady=10, ipadx=20, ipady=5)
        
    def start_generation(self):
        username = self.username_var.get().strip()
        github_token = self.github_token_var.get().strip()
        gemini_key = self.gemini_key_var.get().strip()
        jd = self.jd_text.get("1.0", tk.END).strip()
        
        if not username or not github_token or not gemini_key or not jd:
            messagebox.showerror("Error", "All fields are required!")
            return
            
        self.generate_btn.config(state=tk.DISABLED, text="Generating...")
        self.status_var.set("Saving JD and initializing AI... (This may take 15-30s)")
        self.status_label.config(foreground="blue")
        
        threading.Thread(target=self.run_cli, args=(username, github_token, gemini_key, jd), daemon=True).start()
        
    def run_cli(self, username, github_token, gemini_key, jd):
        try:
            jd_path = "temp_jd.txt"
            with open(jd_path, "w", encoding="utf-8") as f:
                f.write(jd)
                
            env = os.environ.copy()
            env["GITHUB_TOKEN"] = github_token
            env["GEMINI_API_KEY"] = gemini_key
            
            output_pdf = f"output_{username}.pdf"
            
            command = ["node", "dist/index.js", "--user", username, "--jd", jd_path, "--output", output_pdf]
            
            # creationflags=0x08000000 (CREATE_NO_WINDOW) to prevent console popup on Windows
            creationflags = 0x08000000 if sys.platform == 'win32' else 0
            process = subprocess.Popen(
                command,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                creationflags=creationflags
            )
            
            stdout, _ = process.communicate()
            
            if process.returncode == 0:
                self.root.after(0, self.on_success, output_pdf)
            else:
                self.root.after(0, self.on_error, stdout)
                
        except Exception as e:
            self.root.after(0, self.on_error, str(e))
            
    def on_success(self, output_pdf):
        self.status_var.set(f"Success! PDF saved as {output_pdf}")
        self.status_label.config(foreground="green")
        self.generate_btn.config(state=tk.NORMAL, text="Generate PDF")
        
        # Open the PDF automatically on Windows
        if sys.platform == 'win32':
            os.startfile(output_pdf)
            
        messagebox.showinfo("Success", f"Portfolio successfully generated:\n{output_pdf}")
        
    def on_error(self, error_msg):
        self.status_var.set("An error occurred.")
        self.status_label.config(foreground="red")
        self.generate_btn.config(state=tk.NORMAL, text="Generate PDF")
        messagebox.showerror("Generation Error", error_msg[:500] + ("..." if len(error_msg) > 500 else ""))

if __name__ == "__main__":
    root = tk.Tk()
    app = PortfolioApp(root)
    root.mainloop()
