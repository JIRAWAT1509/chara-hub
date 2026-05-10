package com.chara.hub.status;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = {
		"http://localhost:4200",
		"http://127.0.0.1:4200",
		"http://localhost:4201",
		"http://127.0.0.1:4201"
})
class BackendStatusController {

	@GetMapping
	BackendStatusResponse status() {
		return new BackendStatusResponse(
				"chara-hub-api",
				"passive",
				false,
				List.of(
						"Frontend still owns Supabase Auth and direct MVP data access.",
						"Backend is available for health, capability discovery, and future server-side rules."),
				List.of(
						"JWT validation",
						"server-side recommendation policy",
						"backend-only integrations",
						"direct database orchestration"),
				List.of(
						"Do not store service role keys in the frontend.",
						"Do not add datasource config until a backend-owned flow exists.",
						"Do not automate consumer paid AI web subscriptions."));
	}

	record BackendStatusResponse(
			String service,
			String mode,
			boolean ownsUserDataFlow,
			List<String> currentResponsibilities,
			List<String> activationCriteria,
			List<String> boundaries) {
	}
}
