package ds.mesh.project.auth.login;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import ds.mesh.project.R;
import ds.mesh.project.home.view.HomeActivity;

public class LoginActivity extends Activity {



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

    }

    public void onLoginButtonClicked(View view) {
        startActivity(new Intent(this, HomeActivity.class));
    }


}
