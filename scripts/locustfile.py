from locust import HttpUser, task, between


class URLShortenerUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task(10)
    def redirect(self):
        self.client.get("/HudIG9", allow_redirects=False)

    @task(3)
    def create_url(self):
        self.client.post(
            "/urls",
            json={
                "user_id": 1,
                "original_url": f"https://example.com/test/{self.environment.runner.user_count}",
            },
        )

    @task(2)
    def get_user(self):
        self.client.get("/users/1")

    @task(1)
    def health_check(self):
        self.client.get("/health")
