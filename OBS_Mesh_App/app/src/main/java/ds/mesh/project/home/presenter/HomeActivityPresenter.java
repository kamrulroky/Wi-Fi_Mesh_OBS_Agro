package ds.mesh.project.home.presenter;

import ds.mesh.project.home.view.HomeActivityViewInerface;

/**
 * Created by nasser on 1/9/18.
 */

public class HomeActivityPresenter implements HomeActivityPresenterInterface {

    private HomeActivityViewInerface mHomeViewInterface;


    public HomeActivityPresenter(HomeActivityViewInerface homeViewInterface) {
        this.mHomeViewInterface = homeViewInterface;
    }


    @Override
    public void onDestroy() {

    }
}
