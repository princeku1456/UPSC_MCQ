from playwright.sync_api import sync_playwright
import subprocess
import time

def run():
    server = subprocess.Popen(["python3", "-m", "http.server", "8080"])
    time.sleep(2)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:8080/")

        # Add mock for Firebase to bypass auth
        page.evaluate("""
            window.firebase = {
                auth: () => ({
                    onAuthStateChanged: (cb) => {
                        window.mockUser = { uid: "testuser", email: "test@example.com" };
                        cb(window.mockUser);
                    },
                    currentUser: { uid: "testuser", email: "test@example.com" }
                }),
                firestore: () => ({
                    collection: (col) => ({
                        doc: (d) => ({
                            get: async () => ({ exists: true, data: () => ({}) }),
                            set: async () => ({}),
                            collection: (subcol) => ({
                                get: async () => ({ empty: true, docs: [] })
                            })
                        }),
                        where: () => ({
                            orderBy: () => ({
                                limit: () => ({
                                    get: async () => ({ empty: true, docs: [] })
                                })
                            }),
                            get: async () => ({ empty: true, docs: [] })
                        })
                    })
                })
            };
            window.db = window.firebase.firestore();
        """)

        page.wait_for_timeout(2000)

        logs = []
        page.on("console", lambda msg: logs.append(msg.text))
        page.on("pageerror", lambda err: logs.append("ERROR: " + str(err)))

        page.evaluate("if(typeof showDashboard === 'function') showDashboard();")
        page.wait_for_timeout(1000)

        print("Clicking Practice MCQ...")
        page.evaluate("if(typeof startPracticeSelection === 'function') startPracticeSelection();")
        page.wait_for_timeout(2000)

        print("Logs:")
        for log in logs:
            print(log)

        browser.close()
    server.terminate()

run()
